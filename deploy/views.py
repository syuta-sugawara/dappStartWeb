from django.shortcuts import render
from django.views.generic import ListView
from .models import Project

# Create your views here.

class ProjectListView(ListView):
    model = Project
    template_name='home.html'

