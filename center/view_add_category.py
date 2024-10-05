from django import forms
from .models import Category

class View_category(forms.ModelForm):
    class Meta:
        model = Category
        fields = ['name']