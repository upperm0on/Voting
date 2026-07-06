from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    landingPage, add_category, add_individual, read_categories, detail_category, detail_individual, vote_summary,
    CategoryViewSet, IndividualViewSet, VoterTokenViewSet, VerifyTokenView, BulkVoteView, VoteSummaryAPIView
)

router = DefaultRouter()
router.register(r'api/categories', CategoryViewSet, basename='api-category')
router.register(r'api/individuals', IndividualViewSet, basename='api-individual')
router.register(r'api/voter-tokens', VoterTokenViewSet, basename='api-votertoken')

urlpatterns = [
    path('', landingPage, name="landingPage"),
    path('add_category/', add_category, name="add_category"),
    path('add_individual/', add_individual, name="add_individual"),
    path('read_category/', read_categories, name="read_categories"),
    path('detail_category/<int:id>/', detail_category, name="detail_category"),
    path('detail_individual/<int:id>/', detail_individual, name='detail_individual'),
    path('vote_summary/', vote_summary, name="vote_summary"),
    
    # API endpoints
    path('', include(router.urls)),
    path('api/vote/', BulkVoteView.as_view(), name='api-vote'),
    path('api/verify-token/', VerifyTokenView.as_view(), name='api-verify-token'),
    path('api/vote-summary/', VoteSummaryAPIView.as_view(), name='api-vote-summary'),
]