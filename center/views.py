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


# REST Framework API Views
from rest_framework import viewsets, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from django.db import transaction
from django.utils import timezone
import random
from .models import Category, Individual, Vote_status, VoterToken
from .serializers import CategorySerializer, IndividualSerializer, VoteStatusSerializer, VoterTokenSerializer

class CategoryViewSet(viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class IndividualViewSet(viewsets.ModelViewSet):
    queryset = Individual.objects.all()
    serializer_class = IndividualSerializer
    
    def get_queryset(self):
        queryset = Individual.objects.all()
        category_id = self.request.query_params.get('category', None)
        if category_id is not None:
            queryset = queryset.filter(position_id=category_id)
        return queryset

class VoterTokenViewSet(viewsets.ModelViewSet):
    queryset = VoterToken.objects.all().order_by('-created_at')
    serializer_class = VoterTokenSerializer

    def get_queryset(self):
        queryset = VoterToken.objects.all().order_by('-created_at')
        batch_name = self.request.query_params.get('batch_name', None)
        if batch_name is not None:
            queryset = queryset.filter(batch_name=batch_name)
        return queryset

    @action(detail=False, methods=['get'])
    def batches(self, request):
        from django.db.models import Count, Q
        batches_stats = VoterToken.objects.values('batch_name').annotate(
            total=Count('id'),
            used=Count('id', filter=Q(is_used=True)),
            unused=Count('id', filter=Q(is_used=False))
        ).order_by('-batch_name')
        
        batches_data = []
        for stat in batches_stats:
            batch_name = stat['batch_name']
            first_token = VoterToken.objects.filter(batch_name=batch_name).order_by('created_at').first()
            created_time = first_token.created_at if first_token else None
            batches_data.append({
                'batch_name': batch_name,
                'total': stat['total'],
                'used': stat['used'],
                'unused': stat['unused'],
                'created_at': created_time
            })
        return Response(batches_data)

    @action(detail=False, methods=['post'])
    def generate_batch(self, request):
        batch_name = request.data.get('batch_name', '').strip()
        count = request.data.get('count', 0)
        
        try:
            count = int(count)
        except ValueError:
            return Response({"error": "Count must be an integer"}, status=status.HTTP_400_BAD_REQUEST)

        if not batch_name:
            return Response({"error": "Batch name is required"}, status=status.HTTP_400_BAD_REQUEST)
        if count <= 0 or count > 2000:
            return Response({"error": "Count must be between 1 and 2000"}, status=status.HTTP_400_BAD_REQUEST)

        if VoterToken.objects.filter(batch_name=batch_name).exists():
            return Response({"error": "A token batch with this name already exists"}, status=status.HTTP_400_BAD_REQUEST)

        chars = 'ACDEFGHJKLMNPQRSTUVWXY34679'
        generated = set()
        max_attempts = count * 15
        attempts = 0
        
        while len(generated) < count and attempts < max_attempts:
            tok = ''.join(random.choices(chars, k=4))
            if not VoterToken.objects.filter(token=tok).exists():
                generated.add(tok)
            attempts += 1

        if len(generated) < count:
            return Response({"error": "Failed to generate unique tokens. Try a smaller count or try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        tokens_to_create = [VoterToken(token=t, batch_name=batch_name) for t in generated]
        VoterToken.objects.bulk_create(tokens_to_create)

        return Response({
            "message": f"Successfully generated {count} tokens for batch '{batch_name}'",
            "batch_name": batch_name,
            "count": count
        }, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=['post'])
    def delete_batch(self, request):
        batch_name = request.data.get('batch_name', '').strip()
        if not batch_name:
            return Response({"error": "Batch name is required"}, status=status.HTTP_400_BAD_REQUEST)

        deleted_count, _ = VoterToken.objects.filter(batch_name=batch_name).delete()
        return Response({
            "message": f"Successfully deleted batch '{batch_name}' and its {deleted_count} tokens"
        }, status=status.HTTP_200_OK)

class VerifyTokenView(APIView):
    def post(self, request):
        token_str = request.data.get('token', '').strip().upper()
        if not token_str:
            return Response({"error": "Token is required"}, status=status.HTTP_400_BAD_REQUEST)

        try:
            token_obj = VoterToken.objects.get(token=token_str)
            if token_obj.is_used:
                return Response({"error": "This token has already been used to cast a vote."}, status=status.HTTP_400_BAD_REQUEST)
            return Response({
                "valid": True,
                "token": token_obj.token,
                "batch_name": token_obj.batch_name
            }, status=status.HTTP_200_OK)
        except VoterToken.DoesNotExist:
            return Response({"error": "Invalid token. Please check and try again."}, status=status.HTTP_400_BAD_REQUEST)

class BulkVoteView(APIView):
    def post(self, request):
        votes = request.data.get('votes', [])
        token_str = request.data.get('token', '').strip().upper()

        if not token_str:
            return Response({"error": "Voter token is required to cast a vote."}, status=status.HTTP_400_BAD_REQUEST)
        if not votes:
            return Response({"error": "No votes provided"}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            with transaction.atomic():
                token_obj = VoterToken.objects.select_for_update().get(token=token_str)
                if token_obj.is_used:
                    return Response({"error": "This token has already been used to cast a vote. Vote rejected."}, status=status.HTTP_400_BAD_REQUEST)
                
                created_votes = []
                for vote_item in votes:
                    individual_id = None
                    if isinstance(vote_item, dict):
                        individual_id = vote_item.get('voted_for') or vote_item.get('individual_id')
                    else:
                        individual_id = vote_item
                    
                    candidate = Individual.objects.get(id=individual_id)
                    vote = Vote_status.objects.create(voted_for=candidate)
                    created_votes.append(VoteStatusSerializer(vote).data)
                
                token_obj.is_used = True
                token_obj.used_at = timezone.now()
                token_obj.save()
        except VoterToken.DoesNotExist:
            return Response({"error": "Invalid token. Vote rejected."}, status=status.HTTP_400_BAD_REQUEST)
        except Individual.DoesNotExist:
            return Response({"error": "One of the selected candidates does not exist. Ballot submission aborted."}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)
            
        return Response({"message": f"Successfully cast {len(created_votes)} votes", "votes": created_votes}, status=status.HTTP_201_CREATED)


class VoteSummaryAPIView(APIView):
    def get(self, request):
        categories = Category.objects.all()
        individuals = Individual.objects.all()
        
        data = []
        for cat in categories:
            individual_qs = individuals.filter(position=cat)
            individual_list = []
            
            total_cat_votes = 0
            for indv in individual_qs:
                vs_count = Vote_status.objects.filter(voted_for=indv).count()
                total_cat_votes += vs_count
                
                pic_url = indv.picture.url if indv.picture else None
                if pic_url and not pic_url.startswith('http'):
                    pic_url = request.build_absolute_uri(pic_url)
                
                individual_list.append({
                    'id': indv.id,
                    'individual': indv.name,
                    'picture': pic_url,
                    'votes': vs_count
                })
            
            # Sort individuals by votes descending
            individual_list.sort(key=lambda x: x['votes'], reverse=True)
            
            winner = None
            if individual_list:
                max_votes = individual_list[0]['votes']
                if max_votes > 0:
                    winner = individual_list[0]
            
            data.append({
                'category_id': cat.id,
                'category': cat.name,
                'total_votes': total_cat_votes,
                'details': individual_list,
                'winner': winner
            })
            
        return Response(data, status=status.HTTP_200_OK)