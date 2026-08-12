from django.db.models import Q, Sum

from rest_framework import viewsets, permissions
from rest_framework.decorators import action
from rest_framework.response import Response

from .permissions import AssetPermission
from .models import Asset
from .serializers import AssetSerializer


class AssetViewSet(viewsets.ModelViewSet):
    serializer_class = AssetSerializer
    permission_classes = [
        AssetPermission,
    ]

    def get_queryset(self):
        user = self.request.user

        # User must belong to an organization
        if not user.is_authenticated or not user.organization:
            return Asset.objects.none()

        queryset = (
            Asset.objects
            .filter(
                organization=user.organization
            )
            .select_related(
                "project",
                "organization",
                "created_by",
                "updated_by",
            )
            .prefetch_related(
                "server_spec",
                "storage_spec",
                "network_spec",
                "backup_spec",
                "cloud_spec",
            )
        )

        asset_type = self.request.query_params.get("asset_type")
        status_value = self.request.query_params.get("status")
        environment = self.request.query_params.get("environment")
        search = self.request.query_params.get("search")

        if asset_type:
            queryset = queryset.filter(
                asset_type=asset_type
            )

        if status_value:
            queryset = queryset.filter(
                status=status_value
            )

        if environment:
            queryset = queryset.filter(
                environment=environment
            )

        if search:
            queryset = queryset.filter(
                Q(name__icontains=search)
                | Q(asset_code__icontains=search)
                | Q(site_name__icontains=search)
                | Q(location__icontains=search)
            )

        return queryset

    def perform_create(self, serializer):
        user = self.request.user

        if not user.organization:
            raise permissions.PermissionDenied(
                "User is not associated with an organization."
            )

        serializer.save(
            organization=user.organization,
            created_by=user,
        )

    def perform_update(self, serializer):
        user = self.request.user

        if not user.organization:
            raise permissions.PermissionDenied(
                "User is not associated with an organization."
            )

        serializer.save(
            organization=user.organization,
            updated_by=user,
        )

    @action(
        detail=False,
        methods=["get"],
        url_path="stats",
    )
    def stats(self, request):
        queryset = self.get_queryset()

        total = (
            queryset.aggregate(
                total=Sum("quantity")
            )["total"]
            or 0
        )

        by_type = {}

        for asset_type, _label in Asset.ASSET_TYPES:
            by_type[asset_type] = (
                queryset
                .filter(asset_type=asset_type)
                .aggregate(
                    total=Sum("quantity")
                )["total"]
                or 0
            )

        return Response({
            "total": total,
            "by_type": by_type,
        })
        