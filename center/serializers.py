from rest_framework import serializers
from .models import Category, Individual, Vote_status, VoterToken


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name']

class IndividualSerializer(serializers.ModelSerializer):
    position_name = serializers.CharField(source='position.name', read_only=True)

    class Meta:
        model = Individual
        fields = ['id', 'position', 'position_name', 'name', 'picture']

class VoteStatusSerializer(serializers.ModelSerializer):
    class Meta:
        model = Vote_status
        fields = ['id', 'voted_for', 'time_stamp']

class VoterTokenSerializer(serializers.ModelSerializer):
    class Meta:
        model = VoterToken
        fields = ['id', 'token', 'is_used', 'batch_name', 'created_at', 'used_at']

