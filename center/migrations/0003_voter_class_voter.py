# Generated by Django 5.1.1 on 2024-10-07 11:30

import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('center', '0002_vote_status'),
    ]

    operations = [
        migrations.CreateModel(
            name='Voter_class',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('voter_class_name', models.CharField(max_length=244)),
            ],
        ),
        migrations.CreateModel(
            name='Voter',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('voter_id', models.CharField(max_length=225)),
                ('voter_class', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='center.voter_class')),
            ],
        ),
    ]
