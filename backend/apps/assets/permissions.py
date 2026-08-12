from rest_framework.permissions import BasePermission


class AssetPermission(BasePermission):

    def has_permission(self, request, view):
        user = request.user

        # Must be authenticated
        if not user or not user.is_authenticated:
            return False

        # Must belong to an organization
        if not user.organization:
            return False

        # Everyone in the organization can view
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Admin can create, edit, and delete
        if user.role == 'admin':
            return True

        # Architect permissions
        if user.role == 'architect':

            # Creating an asset:
            # user must be an active member of the selected project
            if request.method == 'POST':
                project_id = request.data.get('project')

                if not project_id:
                    return False

                return user.project_memberships.filter(
                    project_id=project_id,
                    is_active=True,
                ).exists()

            # Object-level permission will determine
            # PUT/PATCH/DELETE.
            return True

        return False

    def has_object_permission(
        self,
        request,
        view,
        obj,
    ):
        user = request.user

        # Must be authenticated
        if not user or not user.is_authenticated:
            return False

        # Asset must belong to the user's organization
        if obj.organization_id != user.organization_id:
            return False

        # Everyone in the organization can view
        if request.method in ['GET', 'HEAD', 'OPTIONS']:
            return True

        # Admin has full access
        if user.role == 'admin':
            return True

        # Architects must be active members of
        # the asset's project to modify it.
        if user.role == 'architect':

            if not obj.project:
                return False

            return obj.project.memberships.filter(
                user=user,
                is_active=True,
            ).exists()

        return False