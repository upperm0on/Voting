from django.db import models

# Create your models here.
class Category(models.Model):
    name = models.CharField(max_length=255)

    def __str__(self):
        return self.name

class Individual(models.Model):
    position = models.ForeignKey(Category, on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    picture = models.ImageField(upload_to='media/')

    def __str__(self):
        return self.name

class Vote_status(models.Model):
    voted_for = models.ForeignKey(Individual, on_delete=models.CASCADE)
    time_stamp = models.DateTimeField(auto_now_add=True)
    

class Voter_class(models.Model): 
    voter_class_name = models.CharField(max_length=244)

class Voter(models.Model): 
    voter_id = models.CharField(max_length=225)
    voter_class = models.ForeignKey(Voter_class, on_delete=models.CASCADE)
    voter_status_list = [('Voted', 'Voted'), ('not_voted', 'not_voted'), ('pending', 'pending')]
    voter_status = models.CharField(max_length=255, choices=voter_status_list, default='not_voted')

    def __str__(self): 
        return f'{self.voter_id} {self.voter_status}'