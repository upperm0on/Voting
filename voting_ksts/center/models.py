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