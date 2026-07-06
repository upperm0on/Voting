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

class VoterToken(models.Model):
    token = models.CharField(max_length=4, unique=True, db_index=True)
    is_used = models.BooleanField(default=False)
    batch_name = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.token} - {self.batch_name} ({'Used' if self.is_used else 'Unused'})"