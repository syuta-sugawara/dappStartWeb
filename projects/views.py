from django.shortcuts import render
from django.views.generic import ListView
from django.views.generic.edit import CreateView
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

