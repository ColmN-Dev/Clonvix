from rest_framework import serializers
from .models import Profile

# Serializer for the Profile model
class ProfileSerializer(serializers.ModelSerializer):
    username = serializers.CharField(source='user.username', read_only=True)

    class Meta:
        model = Profile
        fields = ['username', 'display_name', 'bio', 'image', 'location', 'website', 'social_links']
    
    # Limit social links to a maximum of four
    def validate_social_links(self, value):
        if not isinstance(value, list):
            raise serializers.ValidationError("Social links must be a list.")

        if len(value) > 4:
            raise serializers.ValidationError("You can add a maximum of 4 social links.")

        return value
    
    # Serializer field for the image URL
    image = serializers.ImageField(required=False)
    
    # Override the to_representation method to include the image URL in the serialized data
    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = instance.image.url if instance.image else ''
        return data