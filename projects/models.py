
from django.conf import settings
from django.contrib.auth import get_user_model
from django.db import models
from django.urls import reverse

from django.db import models

# Create your models here.
class Project(models.Model):
    title=models.CharField(max_length=200)

    def __str__(self):
        return self.title

    def get_absolute_url(self):
        return reverse('project_list')