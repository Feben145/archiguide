from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import (
    Organization,
    Division,
    Department,
    Section,
    Project,
    ProjectMembership,
)

User = get_user_model()


class OrganizationSerializer(serializers.ModelSerializer):

    user_count = serializers.IntegerField(
        source='users.count',
        read_only=True
    )

    class Meta:
        model = Organization
        fields = [
            'id',
            'name',
            'user_count',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'created_at',
            'updated_at',
        ]



class DivisionSerializer(serializers.ModelSerializer):

    organization_name = serializers.CharField(
        source='organization.name',
        read_only=True
    )


    class Meta:
        model = Division

        fields = [
            'id',
            'name',
            'organization',
            'organization_name',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'created_at',
            'updated_at',
        ]



class DepartmentSerializer(serializers.ModelSerializer):

    division_name = serializers.CharField(
        source='division.name',
        read_only=True
    )


    class Meta:
        model = Department

        fields = [
            'id',
            'name',
            'division',
            'division_name',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'created_at',
            'updated_at',
        ]



class SectionSerializer(serializers.ModelSerializer):

    department_name = serializers.CharField(
        source='department.name',
        read_only=True
    )


    class Meta:
        model = Section

        fields = [
            'id',
            'name',
            'department',
            'department_name',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'created_at',
            'updated_at',
        ]



class UserSerializer(serializers.ModelSerializer):

    organization_name = serializers.CharField(
        source='organization.name',
        read_only=True
    )


    division_name = serializers.CharField(
        source='division.name',
        read_only=True
    )


    department_name = serializers.CharField(
        source='department.name',
        read_only=True
    )


    section_name = serializers.CharField(
        source='section.name',
        read_only=True
    )


    class Meta:
        model = User

        fields = [
            'id',

            'username',
            'email',

            'first_name',
            'last_name',

            'role',

            'job_title',
            'phone',

            'avatar_initials',

            'organization',
            'organization_name',

            'division',
            'division_name',

            'department',
            'department_name',

            'section',
            'section_name',

            'is_active',

            'created_at',
            'updated_at',
        ]


        read_only_fields = [
            'organization','id',
            'organization',
            'organization_name',
            'avatar_initials',
            'created_at',
            'updated_at',
            
        ]



    def validate(self, data):

        division = data.get(
            'division',
            getattr(self.instance, 'division', None)
        )

        department = data.get(
            'department',
            getattr(self.instance, 'department', None)
        )

        section = data.get(
            'section',
            getattr(self.instance, 'section', None)
        )


        if department and division:

            if department.division != division:

                raise serializers.ValidationError(
                    {
                        'department':
                        'Department does not belong to selected division.'
                    }
                )


        if section and department:

            if section.department != department:

                raise serializers.ValidationError(
                    {
                        'section':
                        'Section does not belong to selected department.'
                    }
                )


        return data



class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )


    password2 = serializers.CharField(
        write_only=True
    )


    class Meta:

        model = User

        fields = [
            'username',
            'email',

            'first_name',
            'last_name',

            'password',
            'password2',

            'job_title',
            'phone',
        ]



    def validate_username(self, value):

        if User.objects.filter(
            username=value
        ).exists():

            raise serializers.ValidationError(
                'Username already exists.'
            )

        return value



    def validate(self, data):

        if data['password'] != data['password2']:

            raise serializers.ValidationError(
                {
                    'password':
                    'Passwords do not match.'
                }
            )

        return data



    def create(self, validated_data):

        validated_data.pop(
            'password2'
        )

        password = validated_data.pop(
            'password'
        )


        organization = Organization.objects.get(
            name="Ethio Telecom"
        )


        user = User(
            **validated_data,
            organization=organization,
            role='architect'
        )


        user.set_password(
            password
        )


        user.save()

        return user



class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(
        required=True
    )


    new_password = serializers.CharField(
        required=True,
        min_length=8
    )
class ProjectSerializer(serializers.ModelSerializer):

    organization_name = serializers.CharField(
        source='organization.name',
        read_only=True,
    )

    member_count = serializers.SerializerMethodField()

    class Meta:
        model = Project

        fields = [
            'id',
            'name',
            'description',
            'organization',
            'organization_name',
            'member_count',
            'is_active',
            'created_at',
            'updated_at',
        ]

        read_only_fields = [
            'id',
            'organization',
            'organization_name',
            'member_count',
            'created_at',
            'updated_at',
        ]

    def get_member_count(self, obj):
        return obj.memberships.filter(
            is_active=True
        ).count()

class ProjectMembershipSerializer(serializers.ModelSerializer):

    username = serializers.CharField(
        source='user.username',
        read_only=True,
    )

    user_name = serializers.SerializerMethodField()

    project_name = serializers.CharField(
        source='project.name',
        read_only=True,
    )

    class Meta:
        model = ProjectMembership

        fields = [
            'id',
            'project',
            'project_name',
            'user',
            'username',
            'user_name',
            'is_active',
            'joined_at',
        ]

        read_only_fields = [
            'joined_at',
            'username',
            'user_name',
            'project_name',
        ]

    def get_user_name(self, obj):
        return obj.user.get_full_name()           

