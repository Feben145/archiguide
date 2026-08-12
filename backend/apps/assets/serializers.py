from rest_framework import serializers
from apps.accounts.models import Project

from .models import (
    Asset,
    ServerSpec,
    StorageSpec,
    NetworkSpec,
    BackupSpec,
    CloudSpec,
)


class ServerSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServerSpec
        exclude = ["asset"]


class StorageSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = StorageSpec
        exclude = ["asset"]


class NetworkSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = NetworkSpec
        exclude = ["asset"]


class BackupSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = BackupSpec
        exclude = ["asset"]


class CloudSpecSerializer(serializers.ModelSerializer):
    class Meta:
        model = CloudSpec
        exclude = ["asset"]


class AssetSerializer(serializers.ModelSerializer):

    project_name = serializers.CharField(
        source="project.name",
        read_only=True,
    )

    server_spec = ServerSpecSerializer(
        required=False,
        allow_null=True,
    )

    storage_spec = StorageSpecSerializer(
        required=False,
        allow_null=True,
    )

    network_spec = NetworkSpecSerializer(
        required=False,
        allow_null=True,
    )

    backup_spec = BackupSpecSerializer(
        required=False,
        allow_null=True,
    )

    cloud_spec = CloudSpecSerializer(
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Asset

        fields = [
            "id",
            "asset_code",

            # Identity
            "name",
            "project",
            "project_name",
            "quantity",
            "asset_type",
            "deployment_model",
            "environment",
            "data_tier",
            "status",
            "tags",

            # Location
            "site_name",
            "location",
            "rack_position",
            "cloud_provider",
            "cloud_region",
            "cloud_account_id",
            "resource_group",

            # Notes
            "notes",

            # Technical specifications
            "server_spec",
            "storage_spec",
            "network_spec",
            "backup_spec",
            "cloud_spec",

            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]

        read_only_fields = [
            "id",
            "asset_code",
            "project_name",
            "created_at",
            "updated_at",
            "created_by",
            "updated_by",
        ]

    def create(self, validated_data):

        server_data = validated_data.pop(
            "server_spec",
            None
        )

        storage_data = validated_data.pop(
            "storage_spec",
            None
        )

        network_data = validated_data.pop(
            "network_spec",
            None
        )

        backup_data = validated_data.pop(
            "backup_spec",
            None
        )

        cloud_data = validated_data.pop(
            "cloud_spec",
            None
        )

        asset = Asset.objects.create(
            **validated_data
        )

        if server_data:
            ServerSpec.objects.create(
                asset=asset,
                **server_data,
            )

        if storage_data:
            StorageSpec.objects.create(
                asset=asset,
                **storage_data,
            )

        if network_data:
            NetworkSpec.objects.create(
                asset=asset,
                **network_data,
            )

        if backup_data:
            BackupSpec.objects.create(
                asset=asset,
                **backup_data,
            )

        if cloud_data:
            CloudSpec.objects.create(
                asset=asset,
                **cloud_data,
            )

        return asset