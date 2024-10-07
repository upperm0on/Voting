from django import forms
from .models import Category, Voter_class

class View_category(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name']
        
class View_voter_class(forms.ModelForm): 
    class Meta: 
        model = Voter_class
        fields = ['voter_class_name']