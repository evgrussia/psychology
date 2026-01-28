"""
Tests for Role Value Object.
"""
import pytest
from domain.identity.value_objects.role import Role


class TestRole:
    """Tests for Role value object."""
    
    def test_create_valid_role(self):
        """Test creating valid role."""
        role = Role('owner', 'admin')
        
        assert role.code == 'owner'
        assert role.scope == 'admin'
    
    def test_create_invalid_role_code(self):
        """Test creating role with invalid code."""
        with pytest.raises(ValueError, match="Invalid role code"):
            Role('invalid', 'admin')
    
    def test_create_invalid_role_scope(self):
        """Test creating role with invalid scope."""
        with pytest.raises(ValueError, match="Invalid role scope"):
            Role('owner', 'invalid')
    
    def test_is_admin(self):
        """Test is_admin method."""
        admin_role = Role('owner', 'admin')
        product_role = Role('client', 'product')
        
        assert admin_role.is_admin() is True
        assert product_role.is_admin() is False
    
    def test_predefined_roles(self):
        """Test predefined role constants."""
        assert Role.OWNER.code == 'owner'
        assert Role.OWNER.scope == 'admin'
        assert Role.OWNER.is_admin() is True
        
        assert Role.ASSISTANT.code == 'assistant'
        assert Role.ASSISTANT.scope == 'admin'
        
        assert Role.EDITOR.code == 'editor'
        assert Role.EDITOR.scope == 'admin'
        
        assert Role.CLIENT.code == 'client'
        assert Role.CLIENT.scope == 'product'
        assert Role.CLIENT.is_admin() is False
    
    def test_role_equality(self):
        """Test role equality."""
        role1 = Role('owner', 'admin')
        role2 = Role('owner', 'admin')
        role3 = Role('client', 'product')
        
        assert role1 == role2
        assert role1 != role3
    
    def test_role_hash(self):
        """Test role hashability."""
        role1 = Role('owner', 'admin')
        role2 = Role('owner', 'admin')
        
        assert hash(role1) == hash(role2)
