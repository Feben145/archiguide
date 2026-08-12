from django.contrib.auth.models import AbstractUser
from django.db import models


class Organization(models.Model):

    name = models.CharField(
        max_length=200,
        default="Ethio Telecom",
        unique=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:
        ordering = ['name']


    def __str__(self):
        return self.name



class Division(models.Model):

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='divisions'
    )

    name = models.CharField(
        max_length=150
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:
        ordering = ['name']
        unique_together = [
            ('organization', 'name')
        ]


    def __str__(self):
        return self.name



class Department(models.Model):

    division = models.ForeignKey(
        Division,
        on_delete=models.CASCADE,
        related_name='departments'
    )

    name = models.CharField(
        max_length=150
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:
        ordering = ['name']
        unique_together = [
            ('division', 'name')
        ]


    def __str__(self):
        return self.name



class Section(models.Model):

    department = models.ForeignKey(
        Department,
        on_delete=models.CASCADE,
        related_name='sections'
    )

    name = models.CharField(
        max_length=150
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )


    class Meta:
        ordering = ['name']
        unique_together = [
            ('department', 'name')
        ]


    def __str__(self):
        return self.name



class User(AbstractUser):

    ROLE_CHOICES = [
        ('admin', 'Admin'),
        ('architect', 'Architect'),
        ('viewer', 'Viewer'),
    ]

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='users'
    )

    division = models.ForeignKey(
        Division,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='users'
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default='architect'
    )

    avatar_initials = models.CharField(
        max_length=3,
        blank=True
    )

    job_title = models.CharField(
        max_length=150,
        blank=True
    )

    phone = models.CharField(
        max_length=30,
        blank=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    def save(self, *args, **kwargs):

        if not self.avatar_initials:
            parts = self.get_full_name().split()

            self.avatar_initials = (
                ''.join(
                    p[0].upper()
                    for p in parts[:2]
                )
                or self.username[:2].upper()
            )

        super().save(*args, **kwargs)

    def __str__(self):
        return f'{self.get_full_name()} ({self.username})'

class Project(models.Model):

    organization = models.ForeignKey(
        Organization,
        on_delete=models.CASCADE,
        related_name='projects'
    )

    name = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = ['name']
        constraints = [
            models.UniqueConstraint(
                fields=['organization', 'name'],
                name='unique_project_per_organization'
            )
        ]

    def __str__(self):
        return self.name


class ProjectMembership(models.Model):

    project = models.ForeignKey(
        Project,
        on_delete=models.CASCADE,
        related_name='memberships'
    )

    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='project_memberships'
    )

    is_active = models.BooleanField(
        default=True
    )

    joined_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ['user__username']
        constraints = [
            models.UniqueConstraint(
                fields=['project', 'user'],
                name='unique_project_member'
            )
        ]

    def __str__(self):
        return f'{self.user.username} - {self.project.name}'        