import uuid

from django.db import models
from apps.accounts.models import (
    Organization,
    User,
    Division,
    Department,
    Section,
)


class Asset(models.Model):

    ASSET_TYPES = [
        ("server", "Server / VM / Instance"),
        ("storage", "Storage System"),
        ("network", "Network Device"),
        ("backup", "Backup System / Policy"),
        ("software", "Software License"),
        ("cloud_service", "Cloud Service / PaaS / SaaS"),
        ("container", "Container / K8s Workload"),
        ("endpoint", "Endpoint / Workstation"),
        ("iot", "IoT / Edge Device"),
        ("telecom", "Telecom / UC Equipment"),
        ("facility", "Facility / Power / Cooling"),
        ("other", "Other"),
    ]

    STATUS_CHOICES = [
        ("active", "Active"),
        ("maintenance", "Under Maintenance"),
        ("retired", "Retired"),
        ("expiring", "Expiring Soon"),
        ("planned", "Planned / In Procurement"),
        ("disposed", "Disposed"),
        ("decommissioning", "Being Decommissioned"),
    ]

    ENVIRONMENT_CHOICES = [
        ("prod", "Production"),
        ("staging", "Staging / UAT"),
        ("dev", "Development"),
        ("dr", "Disaster Recovery"),
        ("lab", "Lab / Test"),
        ("sandbox", "Sandbox"),
        ("shared", "Shared Services"),
    ]

    DEPLOYMENT_MODEL_CHOICES = [
        ("on_prem", "On-Premises"),
        ("private_cloud", "Private Cloud"),
        ("public_cloud", "Public Cloud"),
        ("hybrid", "Hybrid Cloud"),
        ("multi_cloud", "Multi-Cloud"),
        ("edge", "Edge / Remote Site"),
        ("colocation", "Co-location"),
        ("managed_service", "Managed Service"),
    ]

    id = models.UUIDField(
        primary_key=True,
        default=uuid.uuid4,
        editable=False,
    )

    asset_code = models.CharField(
        max_length=50,
        unique=True,
        blank=True,
    )

    # ============================================================
    # ORGANIZATIONAL OWNERSHIP
    # ============================================================

    organization = models.ForeignKey(
        Organization,
        on_delete=models.PROTECT,
        related_name="assets",
        
    )

    division = models.ForeignKey(
        Division,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets",
    )

    department = models.ForeignKey(
        Department,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets",
    )

    section = models.ForeignKey(
        Section,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="assets",
    )

    # ============================================================
    # IDENTITY
    # ============================================================

    name = models.CharField(
        max_length=255
    )

    project = models.ForeignKey(
        'accounts.Project',
        on_delete=models.PROTECT,
        related_name='assets',
        
    )

    asset_type = models.CharField(
        max_length=30,
        choices=ASSET_TYPES,
    )

    quantity = models.PositiveIntegerField(
        default=1
    )


    deployment_model = models.CharField(
        max_length=30,
        choices=DEPLOYMENT_MODEL_CHOICES,
        default="on_prem",
    )

    environment = models.CharField(
        max_length=20,
        choices=ENVIRONMENT_CHOICES,
        default="prod",
    )

    data_tier = models.CharField(
        max_length=1,
        default="1",
    )

    status = models.CharField(
        max_length=30,
        choices=STATUS_CHOICES,
        default="active",
    )

    tags = models.JSONField(
        default=list,
        blank=True,
    )

    # ============================================================
    # LOCATION
    # ============================================================

    site_name = models.CharField(
        max_length=255,
        blank=True,
    )

    location = models.CharField(
        max_length=255,
        blank=True,
    )

    rack_position = models.CharField(
        max_length=100,
        blank=True,
    )

    cloud_provider = models.CharField(
        max_length=100,
        blank=True,
    )

    cloud_region = models.CharField(
        max_length=100,
        blank=True,
    )

    cloud_account_id = models.CharField(
        max_length=255,
        blank=True,
    )

    resource_group = models.CharField(
        max_length=255,
        blank=True,
    )

    # ============================================================
    # NOTES
    # ============================================================

    notes = models.TextField(
        blank=True,
    )

    # ============================================================
    # AUDIT
    # ============================================================

    created_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="created_assets",
    )

    updated_by = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="updated_assets",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):

        if not self.asset_code:
            self.asset_code = self.generate_asset_code()

        super().save(*args, **kwargs)

    def generate_asset_code(self):

        prefix = {
            "server": "SRV",
            "storage": "STR",
            "network": "NET",
            "backup": "BKP",
            "software": "SW",
            "cloud_service": "CLD",
            "container": "CTR",
            "endpoint": "END",
            "iot": "IOT",
            "telecom": "TEL",
            "facility": "FAC",
            "other": "AST",
        }.get(self.asset_type, "AST")

        return f"{prefix}-{uuid.uuid4().hex[:8].upper()}"

    def __str__(self):
        return f"{self.asset_code} - {self.name}"

class ServerSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        related_name="server_spec",
    )

    server_role = models.CharField(max_length=50, blank=True)
    server_type = models.CharField(max_length=50, blank=True)
    solution_name = models.CharField(max_length=255, blank=True)

    vcpu_count = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
    ram_gb = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
    system_disk_gb = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    cloud_instance_type = models.CharField(
        max_length=255,
        blank=True,
    )

    os = models.CharField(
        max_length=255,
        blank=True,
    )

    cluster_config = models.CharField(
        max_length=50,
        blank=True,
    )

    primary_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    availability_zone = models.CharField(
        max_length=100,
        blank=True,
    )

    def __str__(self):
        return f"Server Spec - {self.asset.name}"  
class StorageSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        related_name="storage_spec",
    )

    storage_type = models.CharField(
        max_length=50,
        blank=True,
    )

    solution_name = models.CharField(
        max_length=255,
        blank=True,
    )

    raw_capacity_tb = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    usable_capacity_tb = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    media_type = models.CharField(
        max_length=50,
        blank=True,
    )

    raid_level = models.CharField(
        max_length=30,
        blank=True,
    )

    primary_protocol = models.CharField(
        max_length=30,
        blank=True,
    )
class NetworkSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        related_name="network_spec",
    )

    device_type = models.CharField(
        max_length=50,
        blank=True,
    )

    solution_name = models.CharField(
        max_length=255,
        blank=True,
    )

    redundancy_mode = models.CharField(
        max_length=50,
        blank=True,
    )

    ports_10g = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    ports_100g = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    management_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    firmware_version = models.CharField(
        max_length=100,
        blank=True,
    )
class BackupSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        related_name="backup_spec",
    )

    solution_name = models.CharField(
        max_length=255,
        blank=True,
    )

    backup_software = models.CharField(
        max_length=255,
        blank=True,
    )

    backup_type = models.CharField(
        max_length=50,
        blank=True,
    )

    backup_rule = models.CharField(
        max_length=50,
        blank=True,
    )

    daily_retention_days = models.PositiveIntegerField(
        default=7,
    )

    weekly_retention_weeks = models.PositiveIntegerField(
        default=4,
    )

    monthly_retention_months = models.PositiveIntegerField(
        default=12,
    )

    rto_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    rpo_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    encryption = models.CharField(
        max_length=30,
        blank=True,
    )
      # New backup infrastructure fields
    controller_count = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    raw_capacity_tb = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    usable_capacity_tb = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    raid_level = models.CharField(
        max_length=30,
        blank=True,
    )

    disk_type = models.CharField(
        max_length=50,
        blank=True,
    )

    disk_count = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    management_ip = models.GenericIPAddressField(
        null=True,
        blank=True,
    )

    firmware_storage_os = models.CharField(
        max_length=255,
        blank=True,
    )
class CloudSpec(models.Model):
    asset = models.OneToOneField(
        Asset,
        on_delete=models.CASCADE,
        related_name="cloud_spec",
    )

    service_type = models.CharField(
        max_length=50,
        blank=True,
    )

    service_name = models.CharField(
        max_length=255,
        blank=True,
    )

    service_tier = models.CharField(
        max_length=255,
        blank=True,
    )

    billing_model = models.CharField(
        max_length=50,
        blank=True,
    )

    monthly_cost_usd = models.DecimalField(
        max_digits=12,
        decimal_places=2,
        null=True,
        blank=True,
    )

    ha_config = models.CharField(
        max_length=50,
        blank=True,
    )

    vcpu_count = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    ram_gb = models.PositiveIntegerField(
        null=True,
        blank=True,
    )

    storage_gb = models.PositiveIntegerField(
        null=True,
        blank=True,
    )
