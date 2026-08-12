#backend/apps/assets/urls.py
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet
from rest_framework.routers import DefaultRouter
from .views import AssetViewSet

router = DefaultRouter()
router.register(r'assets', AssetViewSet, basename='asset')

#urlpatterns = router.urls

urlpatterns = [
path('', include(router.urls)),
#path('assets/import/csv/',      import_assets_csv),
#path('assets/import/template/', get_asset_csv_template),
]