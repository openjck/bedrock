# This Source Code Form is subject to the terms of the Mozilla Public
# License, v. 2.0. If a copy of the MPL was not distributed with this
# file, You can obtain one at http://mozilla.org/MPL/2.0/.

from django.conf.urls.defaults import *

from bedrock.mozorg.util import page
from bedrock.projects import views

urlpatterns = patterns('',
    page('/security/certs/policy', 'projects/policy.html'),
    page('/security/certs/policy/InclusionPolicy.html', 'projects/inclusion.html'),
    page('/security/certs/policy/MaintenancePolicy.html', 'projects/maintenance.html'),
    page('/security/certs/policy/EnforcementPolicy.html', 'projects/enforcement.html'),
    page('/security/certs/pending', 'projects/pending.html'),
    page('/security/certs/included', 'projects/included.html'),
)
