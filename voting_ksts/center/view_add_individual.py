from .models import Individual

from django import forms

class View_Individual(forms.ModelForm):
    class Meta:
        model = Individual
        fields = ['name', 'picture', 'position']