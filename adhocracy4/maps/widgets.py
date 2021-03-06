import json

from django.conf import settings
from django.forms.widgets import Widget
from django.template import loader


class MapChoosePolygonWidget(Widget):

    class Media:
        js = (
            'leaflet.js',
            'leaflet.draw.js',
            'a4maps/map_choose_polygon.js'
        )
        css = {'all': [
            'leaflet.css',
            'leaflet.draw.css',
        ]}

    def render(self, name, value, attrs):

        context = {
            'baseurl': settings.A4_MAP_BASEURL,
            'attribution': settings.A4_MAP_ATTRIBUTION,
            'bbox': json.dumps(settings.A4_MAP_BOUNDING_BOX),
            'name': name,
            'polygon': value
        }

        return loader.render_to_string(
            'a4maps/map_choose_polygon_widget.html',
            context
        )


class MapChoosePointWidget(Widget):

    def __init__(self, polygon, attrs=None):
        self.polygon = polygon
        super().__init__(attrs)

    class Media:
        js = (
            'leaflet.js',
            'a4maps/map_choose_point.js',
        )
        css = {'all': [
            'leaflet.css',
        ]}

    def render(self, name, value, attrs):

        context = {
            'baseurl': settings.A4_MAP_BASEURL,
            'attribution': settings.A4_MAP_ATTRIBUTION,
            'name': name,
            'point': value,
            # .dumps is required here because we pass it directly instead of
            # retrieving it from the widget which calls value_from_object.
            'polygon': json.dumps(self.polygon)
        }

        return loader.render_to_string(
            'a4maps/map_choose_point_widget.html',
            context
        )
