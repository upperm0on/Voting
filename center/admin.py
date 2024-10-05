from django.contrib import admin
from .models import Individual, Category, Vote_status
# Register your models here.

admin.site.register(Individual)
admin.site.register(Category)
admin.site.register(Vote_status)
