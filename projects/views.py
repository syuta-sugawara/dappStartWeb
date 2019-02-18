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
    queryset = Project.objects.order_by('-id')
    template_name='project_list.html'

class ProjectCreateView(CreateView):
    http_method_names = ['post']
    model = Project
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

def get_faucet(request):
    response = requests.get('http://faucet.cryptokylin.io/get_token?' + request.GET.get('name'))
    json = response.json()
    if json['msg'] == 'succeeded':
        response_json = {"result": { "error": False }}
        return JsonResponse(response_json)
    else:
        response_json = {"result": { "data": json['msg'], "error": True }}
        return JsonResponse(response_json)

