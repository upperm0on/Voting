from django.shortcuts import render, HttpResponse, redirect
from .view_add_category import View_category
from .models import Category, Individual, Vote_status
from .view_add_individual import View_Individual
# Create your views here.

import json

from django.shortcuts import render
from django.http import JsonResponse
from .models import Vote_status, Category, Individual  # Make sure to import your models
import json

def landingPage(request):
    # This will hold the final structured list for rendering
    new_list = []
    
    # Get all categories
    category_qs = Category.objects.all()

    # Prepare the structured data for rendering
    for obj in category_qs:
        append_individual = Individual.objects.filter(position=obj)
        
        individual_list = []
        for indv in append_individual:
            individual_list.append({
                'id': indv.id,
                'name': indv.name,
                'picture': indv.picture.url if indv.picture else None
            })
        
        new_list.append({
            'category': obj.name,
            'individuals': individual_list
        })

    # Convert the list of dictionaries to a JSON string
    new_list_json = json.dumps(new_list)

    if request.method == 'POST':
        # Process the votes submitted through the form
        vote_data = request.POST
        
        # Iterate through each submitted vote
        for key, value in vote_data.items():
            # Check if the key corresponds to a vote
            if key.startswith('list_item_category_'):
                # Extract the category name and the voted individual's ID
                category_name = key[len('list_item_category_'):]  # Get the category name
                individual_id = value[0]  # Get the selected individual's ID
                
                # Create and save a new Vote_status object
                vote = Vote_status(
                    voted_for=Individual.objects.get(id=individual_id)
                )
                vote.save()  # Save the vote to the database
    context = {
        'filtered_list': new_list_json,  # Now, new_list is valid JSON data
    }
    
    template_name = 'center/index.html'
    return render(request, template_name, context)



def add_category(request):
    form = View_category()
    if request.method == "POST":
        form = View_category(request.POST or None)
        if form.is_valid():
            form.save()
            return redirect('/')
    context = {
        'forms' : form,
    }
    template_name = 'center/add_category.html'
    return render(request, template_name, context)

def add_individual(request):
    form = View_Individual()
    if request.method == 'POST':
        form = View_Individual(request.POST or None, request.FILES)
        if form.is_valid():
            form.save()
            print(form.cleaned_data)
            return redirect('/')
    template_name = 'center/add_individual.html'
    context = {
        'forms': form,
    }
    return render(request, template_name, context)

def read_categories(request):
    object = Category.objects.all()
    template_name = 'center/read_category.html'
    context = {
        'object': object
    }
    return render(request, template_name, context)

def detail_category(request, id):
    template_name = 'center/detail_category.html',
    queryset = Individual.objects.filter(position__id=id)
    context = {
        'queryset': queryset
    }
    return render(request, template_name, context)

def detail_individual(request, id):
    individual = Individual.objects.get(id=id)
    template_name = 'center/detail_individual.html'
    context = {
        'obj': individual,
    }
    return render(request, template_name, context)

def vote_summary(request):
    all_votes = Vote_status.objects.all()
    category = Category.objects.all()
    individual = Individual.objects.all() 
    
    data = []
    for cat in category: 
        individual_qs = individual.filter(position=cat)
        
        individual_list = []
        for qs in individual_qs:
            vs = Vote_status.objects.filter(voted_for=qs)

            inner_data = {
                'individual': qs.name,
                'votes': vs.count(),
                }
            
            individual_list.append(inner_data)
        data.append({
            'category': cat.name,
            'details': individual_list,
        })
    
    template_name = 'center/voting_summary.html'
    context = {
        'json_data': json.dumps(data),
    }
    return render(request, template_name, context)