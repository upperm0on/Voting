from django.contrib import admin
from .models import Individual, Category, Vote_status, Voter, Voter_class
# Register your models here.

admin.site.register(Individual)
admin.site.register(Category)
admin.site.register(Vote_status)
admin.site.register(Voter)
admin.site.register(Voter_class)
