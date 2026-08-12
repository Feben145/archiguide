from rest_framework import viewsets, generics, status, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from django.contrib.auth import get_user_model

from .models import Organization, Project, ProjectMembership
from .serializers import (
    OrganizationSerializer,
    UserSerializer,
    RegisterSerializer,
    ChangePasswordSerializer,
    ProjectSerializer,
)


User = get_user_model()



class OrganizationViewSet(viewsets.ModelViewSet):

    serializer_class = OrganizationSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]


    def get_queryset(self):

        user = self.request.user

        if user.organization:
            return Organization.objects.filter(
                id=user.organization.id
            )

        return Organization.objects.none()


class ProjectViewSet(viewsets.ModelViewSet):

    serializer_class = ProjectSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_queryset(self):
        user = self.request.user

        if not user.organization:
            return Project.objects.none()

        return Project.objects.filter(
            organization=user.organization
        ).order_by('name')

    def perform_create(self, serializer):
        user = self.request.user

        if not user.organization:
            raise permissions.PermissionDenied(
                'User is not associated with an organization.'
            )

        project = serializer.save(
            organization=user.organization
        )

        ProjectMembership.objects.create(
            project=project,
            user=user,
            is_active=True,
        )


class UserViewSet(viewsets.ModelViewSet):

    serializer_class = UserSerializer
    permission_classes = [
        permissions.IsAuthenticated
    ]


    def get_queryset(self):

        user = self.request.user

        if not user.organization:
            return User.objects.none()


        return User.objects.filter(
            organization=user.organization
        ).order_by(
            'first_name',
            'last_name'
        )

    def perform_create(self, serializer): 
        user = self.request.user # Only admin can create users 
        if user.role != 'admin': 
            raise permissions.PermissionDenied( 'Only administrators can create users.' ) 
        if not user.organization: 
            raise permissions.PermissionDenied( 'User is not associated with an organization.' )
        # Automatically assign the new user # to the admin's organization serializer.save( organization=user.organization )
    
    def perform_update(self, serializer):

        user = self.request.user

        # Only admin can change organizational assignment
        if user.role != 'admin':

            serializer.save(
                organization=user.organization,
                role=user.role
                
            )

        else:
            serializer.save()



    @action(
        detail=False,
        methods=['get', 'patch']
    )
    def me(self, request):

        if request.method == 'GET':

            return Response(
                UserSerializer(request.user).data
            )


        serializer = UserSerializer(
            request.user,
            data=request.data,
            partial=True
        )

        serializer.is_valid(
            raise_exception=True
        )

        serializer.save()

        return Response(
            serializer.data
        )

    @action(
        detail=False,
        methods=['post']
    )
    def change_password(self, request):

        serializer = ChangePasswordSerializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )


        user = request.user


        if not user.check_password(
            serializer.validated_data['old_password']
        ):

            return Response(
                {
                    'error': 'Old password is incorrect.'
                },
                status=status.HTTP_400_BAD_REQUEST
            )


        user.set_password(
            serializer.validated_data['new_password']
        )

        user.save()


        return Response(
            {
                'message': 'Password updated successfully.'
            }
        )



class RegisterView(generics.CreateAPIView):

    serializer_class = RegisterSerializer

    permission_classes = [
    permissions.IsAuthenticated
]