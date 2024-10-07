from django.shortcuts import render, redirect, get_object_or_404, HttpResponse
from .view_add_category import View_category, View_voter_class
from .models import Category, Individual, Vote_status, Voter
from .view_add_individual import View_Individual
# Create your views here.

from django.contrib.auth.models import User
from django.contrib.auth import login, logout, authenticate
from django.contrib.auth.decorators import login_required

import json

from django.shortcuts import render
from django.http import JsonResponse
from .models import Vote_status, Category, Individual, Voter  # Make sure to import your models
import json


def auth_page(request): 
    template_name = "authenticate.html"
    if request.method == 'POST': 
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = User.objects.create(username=username, password=password) 
        login(request, user) 
        return redirect('landingPage')
    context = {
        'auth_status': 'Sign Up',
    }
    return render(request, template_name, context)

def logout_request(request): 
    logout(request)
    return redirect('landingPage')

def login_page(request): 
    template_name = "authenticate.html"
    error_msg = ''
    if request.method == 'POST': 
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        user = authenticate(request, username=username, password=password) 
        if user:
            login(request, user) 
            return redirect('landingPage')
        else: 
            error_msg = 'The Username and password you entered does not exist in the database... Try Again'
    context = {
        'error_msg': error_msg,
        'auth_status': 'Login Here',
    }
    return render(request, template_name, context)

@login_required(login_url='/login_page/')
def landingPage(request):
    # Check if the session contains a valid code; otherwise, redirect
    if not request.session.get('code'):
        return redirect('get_code')
    
    code = request.session.get('code')
    print(f"Session code: {code}")

    # This will hold the final structured list for rendering 
    new_list = []
        
    # Get all categories
    category_qs = Category.objects.all()

    # Prepare the structured data for rendering
    for obj in category_qs:
        # Get all individuals related to this category (position)
        append_individual = Individual.objects.filter(position=obj)
        
        individual_list = []
        for indv in append_individual:
            individual_list.append({
                'id': indv.id,
                'name': indv.name,
                'picture': indv.picture.url if indv.picture else None
            })
        
        new_list.append({
            'category': obj.name,  # Use the category name
            'individuals': individual_list
        })

    # Convert the list of dictionaries to a JSON string
    new_list_json = json.dumps(new_list)

    if request.method == 'POST':
        # Process the votes submitted through the form
        vote_data = request.POST

        # Debugging: Print all the data from the POST request
        print("Submitted vote data:", vote_data)
        
        # Iterate through each submitted vote (category names are now directly used as keys)
        for key, individual_id in vote_data.items():
            if key.startswith('list_item_category_'):
                # Extract the category name from the key
                category_name = key[len('list_item_category_'):]  # Get the category name

                try:
                    # Debugging: Print the category name and individual ID being processed
                    print(f"Processing vote for category: {category_name}, individual ID: {individual_id}")
                    
                    # Create and save a new Vote_status object
                    voted_individual = Individual.objects.get(id=individual_id)
                    vote = Vote_status(
                        voted_for=voted_individual
                    )
                    vote.save()

                except Individual.DoesNotExist:
                    print(f"Individual with ID {individual_id} not found.")
                    continue  # Skip to the next vote

        # Update the voter's status after voting
        try:
            voter = Voter.objects.get(voter_id=code)
            voter.voter_status = 'Voted'
            voter.save()
        except Voter.DoesNotExist:
            print(f"Voter with code {code} not found.")

        # Clear the session after successful vote submission
        request.session['code'] = None
        return redirect('get_code')

    # Pass the structured list as JSON to the template
    context = {
        'filtered_list': new_list_json,
    }

    template_name = 'center/index.html'
    return render(request, template_name, context)


@login_required(login_url='/login_page/')
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

@login_required(login_url='/login_page/')
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

@login_required(login_url='/login_page/')
def read_categories(request):
    object = Category.objects.all()
    template_name = 'center/read_category.html'
    context = {
        'object': object
    }
    return render(request, template_name, context)

@login_required(login_url='/login_page/')
def detail_category(request, id):
    template_name = 'center/detail_category.html',
    queryset = Individual.objects.filter(position__id=id)
    context = {
        'queryset': queryset
    }
    return render(request, template_name, context)

@login_required(login_url='/login_page/')
def detail_individual(request, id):
    individual = Individual.objects.get(id=id)
    template_name = 'center/detail_individual.html'
    context = {
        'obj': individual,
    }
    return render(request, template_name, context)

@login_required(login_url='/login_page/')
def vote_summary(request):
    all_votes = Vote_status.objects.all()
    category = Category.objects.all()
    individual = Individual.objects.all() 
    
    data = []
    for cat in category: 
        individual_qs = individual.filter(position=cat)
        
        individual_list = []
        for qs in individual_qs:
            vs = all_votes.filter(voted_for=qs)

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

def get_code(request): 
    template_name = 'center/get_code.html'
    errorMsg = ''
    
    if request.method == 'POST':
        code = request.POST.get('voter_id')
        
        try: 
            voter_indv = Voter.objects.get(voter_id=code)
            
            # Check if voter has already voted
            if voter_indv.voter_status == 'Voted': 
                errorMsg = 'Code Entered is already used.'
            else:
                # Store voter ID in session and redirect to landingPage
                request.session['code'] = voter_indv.voter_id
                return redirect('landingPage')
        
        except Voter.DoesNotExist:  # Corrected to Voter.DoesNotExist
            errorMsg = 'Code Entered is invalid.'
        
    context = {
        'errorMsg': errorMsg,
    }
    return render(request, template_name, context)


def generate_code(request):
    forms = View_voter_class()
    if request.method == 'POST':
        forms = View_voter_class(request.POST)
        if forms.is_valid():
            instance = forms.save()
            voters_numbers = request.POST['vote_numbers']
            generated_codes = []
            for vote in range(int(voters_numbers)):
                voter_class_name = forms.cleaned_data['voter_class_name']
                new_id = f'{voter_class_name[:3]}{vote}'
                Voter.objects.create(voter_id=new_id, voter_class=instance)
                generated_codes.append(new_id)  # Add generated ID to the list
            
            # Send the generated codes as a JSON response
            return JsonResponse({'codes': generated_codes}, status=200)
    
    return render(request, 'center/generate_code.html', {'forms': forms})

def delete_category(request, id):
    if request.method == 'POST':
        category = get_object_or_404(Category, id=id)
        category.delete()
        return redirect('read_categories') 
    
def delete_individual(request, id):
    if request.method == 'POST':
        individual = get_object_or_404(Individual, id=id)
        individual.delete()
        return redirect('read_categories')