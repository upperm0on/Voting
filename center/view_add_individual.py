from .models import Individual
from django import forms

class View_Individual(forms.ModelForm):
    class Meta:
        model = Individual
        fields = ['name', 'position', 'picture']
        widgets = {
            'name': forms.TextInput(attrs={
                'class': 'form-control',
                'placeholder': 'Enter Name'
            }),
            'picture': forms.ClearableFileInput(attrs={
                'class': 'form-control-file'
            }),
            'position': forms.Select(attrs={
                'class': 'form-control'
            }),
        }
