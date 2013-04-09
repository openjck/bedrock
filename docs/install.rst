.. This Source Code Form is subject to the terms of the Mozilla Public
.. License, v. 2.0. If a copy of the MPL was not distributed with this
.. file, You can obtain one at http://mozilla.org/MPL/2.0/.

.. _install:

==================
Installing Bedrock
==================

Installation
------------

It's a simple `Playdoh
<http://playdoh.readthedocs.org/en/latest/index.html>`_ instance, which is a Django project.

These instructions assume you have `git` and `pip` installed. If you don't have `pip` install, you can install it with `easy_install pip`.

Start by getting the source::

    $ git clone --recursive git://github.com/mozilla/bedrock.git
    $ cd bedrock

**(Make sure you use --recursive)**

You need to create a virtual environment for Python libraries. Skip the first instruction if you already have virtualenv installed::

    $ pip install virtualenv                     # installs virtualenv, skip if already have it
    $ virtualenv venv                            # create a virtual env in the folder `venv`
    $ source venv/bin/activate                   # activate the virtual env
    $ pip install -r requirements/compiled.txt   # installs compiled dependencies

If you are on OSX and some of the compiled dependencies fails to compile, try explicitly setting the arch flags and try again::

    $ export ARCHFLAGS="-arch i386 -arch x86_64"
    $ pip install -r requirements/compiled.txt

Now configure the application to run locally by creating your local settings file::

    $ cp settings/local.py-dist settings/local.py

You shouldn't need customize anything in there yet.

Check out the latest product-details::

    $ ./manage.py update_product_details

Lastly, you need to install `node` and the `less` package. Soon you won't need this for local development but currently it compiles the LESS CSS code on the server-side::

    $ npm -g install less

You don't have to use npm to install less; feel free to install it however you want.

Add the path to the LESS compiler in you `local.py` config file in the `settings` folder. It is most likely `/usr/local/bin/lessc`, so add the following line::

    LESS_BIN = '/usr/local/bin/lessc'

Make it run
-----------

To make the server run, make sure you are inside a virtualenv, and then
run the server::

    $ ./manage.py runserver

If you are not inside a virtualenv, you can activate it by doing::

    $ source venv/bin/activate

If you get the error "NoneType is not iterable", you didn't check out the latest product-details. See the above section for that.

.. _with php:

Run it with the PHP side
------------------------

If you need to run the whole site locally, you'll need to set up the
:ref:`PHP side<php>`, and also set up to serve Bedrock from the same Apache
server at ``/b/``.  That's because the rewrite rules in the
PHP and Apache config assume they can serve requests from Bedrock by
rewriting them internally to have a ``/b/`` on the front of their URLs.

One way to do that is use runserver to serve Bedrock at port 8000 as
above, then proxy to it from Apache. The whole virtual server config
might end up looking like this::

    <VirtualHost *:80>
        ServerName mozilla.local
        VirtualDocumentRoot "/path/to/mozilla.com"
        RewriteEngine On
        RewriteOptions Inherit
        ProxyPass /b http://localhost:8000
        ProxyPassReverse /b http://localhost:8000
        ProxyPass /media http://localhost:8000/media
        ProxyPassReverse /media http://localhost:8000/media
        Include /path/to/bedrock/etc/httpd/global.conf
    </VirtualHost>

But you might have better success using a real WSGI setup that is closer to
what the real servers use.  The following configuration is adapted only
slightly from what the bedrock staging server uses.

Assumptions:

* A Red Hat or Debian-based Linux distribution. (Other distributions might not
  have Apache HTTP Server installed and configured the same way.)
* Apache HTTP Server with php and mod_wsgi
* Subversion mozilla.com checkout at /path/to/mozilla/mozilla.com
* Subversion mozilla.org checkout at /path/to/mozilla/mozilla.com/org
* Bedrock checkout at /path/to/mozilla/bedrock

Edit ``/etc/hosts`` and add::

    127.0.0.1   mozilla.local

Apache config - create file ``/etc/apache2/sites-available/mozilla.com``::

    # Main site at /, django-bedrock at /b
    <VirtualHost *:80 :81>
        ServerName mozilla.local
        ServerAdmin user@example.com
        VirtualDocumentRoot "/path/to/mozilla/mozilla.com"
        DocumentRoot "/path/to/mozilla/mozilla.com"
        AddType application/x-httpd-php .php .html
        DirectoryIndex index.php index.html
        RewriteEngine On
        RewriteMap toupper int:toupper
        SetEnvIf SSLSessionID .+ HTTPS=on

        <Directory "/path/to/mozilla.com">
            Options MultiViews FollowSymLinks -Indexes
            AllowOverride All
            ExpiresActive on
            ExpiresDefault "access plus 15 minutes"
            Options +MultiViews -Indexes
        </Directory>

        <LocationMatch ^/en-US(/projects)?/firefox(/(index.html)?)?$>
            ExpiresActive off
            Header always set "Cache-Control" "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, private, max-age=0"
            Header always set "Pragma" "no-cache"
        </LocationMatch>

        <LocationMatch /en-US/firefox/ie.html>
            ExpiresActive off
            Header always set "Cache-Control" "no-store, no-cache, must-revalidate, post-check=0, pre-check=0, private, max-age=0"
            Header always set "Pragma" "no-cache"
        </LocationMatch>

        SetEnvIf X-Forwarded-For "^.*[\.:].*[\.:].*[\.:].*$" is-forwarded
        LogFormat "%h %v %u %t \"%r\" %>s %b \"%{Referer}i\" \"%{User-Agent}i\" \"%{Cookie}i\"" urchin
        ErrorLog "|/usr/sbin/rotatelogs /var/log/httpd/www.mozilla.org/error_log_%Y-%m-%d-%H 3600 -0"
        CustomLog "|/usr/sbin/rotatelogs /var/log/httpd/www.mozilla.org/access_%Y-%m-%d-%H 3600 -0" urchin env=!is-forwarded
        CustomLog "|/usr/sbin/rotatelogs /var/log/httpd/www.mozilla.org/access_%Y-%m-%d-%H 3600 -0" x-forwarded-for env=is-forwarded

        AddDefaultCharset UTF-8
        AddType image/svg+xml .svg
        AddType application/vnd.mozilla.xul+xml .xul
        AddType text/xml .rdf
        AddType image/x-icon .ico
        AddType text/calendar .ics
        # StarOffice documents
        AddType application/vnd.stardivision.impress .sdd
        AddType application/vnd.stardivision.writer .sdw
        AddType application/vnd.stardivision.draw .sda
        AddType application/vnd.stardivision.calc .sdc

        RewriteMap org-urls-410 txt:/path/to/mozilla.com/org-urls-410.txt
        RewriteMap org-urls-301 txt:/path/to/mozilla.com/org-urls-301.txt

        WSGIDaemonProcess bedrock_stage processes=8 threads=1 display-name=bedrock_stage
        WSGIProcessGroup bedrock_stage
        WSGIScriptAlias /b /path/to/bedrock/wsgi/playdoh.wsgi process-group=bedrock_stage application-group=bedrock_stage

        Alias /media /path/to/bedrock/media
        <Directory /path/to/bedrock/media>
            AllowOverride FileInfo Indexes
        </Directory>

        # DO NOT PUT REWRITES HERE!
        # they are developer-managed, in the upstream app repo, and included here:
        # env-specific file first, because these rewrites generally use [L], so
        # this makes them override-able

        Include /path/to/bedrock/etc/httpd/stage.conf
        Include /path/to/bedrock/etc/httpd/global.conf
    </VirtualHost>

In ``/etc/apache2/envvars``, add the Python path::

    export PYTHONPATH=/path/to/bedrock:/path/to/venv-for-bedrock/lib/python2.7/site-packages

(If you prefer, you can set the Python path on the WSGIDaemonProcess directive instead.)

Then enable the new site, build the css and js files, and finally
restart apache:

.. code-block:: bash

    sudo a2ensite mozilla.com
    python manage.py compress_assets
    sudo service apache2 restart

Troubleshooting
...............

If you get Django error pages reporting I/O errors for .css files, it's because
not all the .css files were compiled before starting Apache and Apache does not
have write permissions in the media directories. Running
`python manage.py compress_assets` should solve it.  Remember to run that
command again anytime the css or less files change.

If you change Python files, either restart Apache or touch playdoh.wsgi, so
that the WSGI processes will be restarted and start running the new code.

If you're working on the rewrite rules in ``bedrock/etc/httpd/*.conf``, be
sure to restart Apache after any change. Apache doesn't re-read those files
after starting.

Localization
------------

If you want to install localizations, just check out the ``locale`` directory::

    git svn clone https://svn.mozilla.org/projects/mozilla.com/trunk/locales/ locale
    # or
    svn checkout https://svn.mozilla.org/projects/mozilla.com/trunk/locales/ locale

You can use git or svn to checkout the repo. Make sure that it is named ``locale``. If you already have it checked out as ``locales``, just do::

    ln -s locales locale

You can read more details about how to localize content :ref:`here<l10n>`.

Notes
-----

A shortcut for activating virtual envs in zsh is `. venv/bin/activate`. The dot is the same as `source`.

There's a project called `virtualenvwrapper <http://www.doughellmann.com/docs/virtualenvwrapper/>`_ that provides a better interface for managing/activating virtual envs, so you can use that if you want.

