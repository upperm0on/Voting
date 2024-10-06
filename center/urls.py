from django.urls import path
from .views import landingPage, add_category, add_individual, read_categories, detail_category, detail_individual, vote_summary, auth_page, login_page, logout_request

urlpatterns = [
    path('', landingPage, name="landingPage"),
    path('add_category/', add_category, name="add_category"),
    path('add_individual/', add_individual, name="add_individual"),
    path('read_category/', read_categories, name="read_categories"),
    path('detail_category/<int:id>/', detail_category, name="detail_category"),
    path('detail_individual/<int:id>/', detail_individual, name='detail_individual'),
    path('vote_summary/', vote_summary, name="vote_summary"),
    path('auth_page/', auth_page, name="auth_page"),
    path('login_page/', login_page, name='login_page'),
    path('logout/', logout_request, name='logout_page'),
]