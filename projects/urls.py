
from django.urls import path

from .views import ProjectListView, ProjectCreateView, create_account, get_faucet

urlpatterns=[
    path('new/',ProjectCreateView.as_view(), name='project_new'),
    path('account/create',create_account, name='create_account'),
    path('account/faucet',get_faucet, name='get_faucet'),
    path('',ProjectListView.as_view(),name='project_list'),
]