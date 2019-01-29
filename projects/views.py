import urllib.request
import requests
from django.shortcuts import render
from django.views.generic import ListView
from django.views.generic.edit import CreateView
from django.http.response import JsonResponse
from .models import Project
from django.urls import reverse_lazy

# Create your views here.

class ProjectListView(ListView):
    model = Project
    template_name='project_list.html'

class ProjectCreateView(CreateView):
    model = Project
    template_name = 'project_new.html'
    fields = ('title',)

def create_account(request):
    response = requests.get('http://faucet.cryptokylin.io/create_account?' + request.GET.get('name'))
    json = response.json()
    if json['msg'] == 'succeeded':
        response_json = {"result": { "data": json['keys'], "error": False }}
        return JsonResponse(response_json)
    else:
        response_json = {"result": { "data": json['msg'], "error": True }}
        return JsonResponse(response_json)

