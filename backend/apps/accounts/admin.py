from django.contrib import admin
from django.contrib.auth.admin import UserAdmin

from .models import (
    User,
    Organization,
    Division,
    Department,
    Section,
    Project,
    ProjectMembership,
)


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = (
        'username',
        'email',
        'first_name',
        'last_name',
        'organization',
        'role',
        'is_active',
    )

    list_filter = (
        'organization',
        'role',
        'is_active',
        'is_staff',
    )

    search_fields = (
        'username',
        'email',
        'first_name',
        'last_name',
    )


@admin.register(Organization)
class OrganizationAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'created_at',
        'updated_at',
    )
    search_fields = ('name',)


@admin.register(Division)
class DivisionAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'organization',
    )
    list_filter = ('organization',)
    search_fields = ('name',)


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'division',
    )
    search_fields = ('name',)


@admin.register(Section)
class SectionAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'department',
    )
    search_fields = ('name',)


@admin.register(Project)
class ProjectAdmin(admin.ModelAdmin):
    list_display = (
        'name',
        'organization',
        'is_active',
        'created_at',
    )
    list_filter = (
        'organization',
        'is_active',
    )
    search_fields = (
        'name',
        'description',
    )


@admin.register(ProjectMembership)
class ProjectMembershipAdmin(admin.ModelAdmin):
    list_display = (
        'project',
        'user',
        'is_active',
        'joined_at',
    )
    list_filter = (
        'project',
        'is_active',
    )
    search_fields = (
        'project__name',
        'user__username',
    )