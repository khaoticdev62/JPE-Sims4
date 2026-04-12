"""
JPE Studio Test Script - Python Injection
Tests: PythonService, OllamaService AI analysis
"""

from sims4.tuning.tunable import TunableReference
from interactions.base.interaction import Interaction
from sims.sim_info import SimInfo
from event_testing.tests import TestList
import services

# Custom interaction injection
class JpeTestGreeting(Interaction):
    """A test greeting interaction for JPE Studio testing."""
    
    @classmethod
    def _tuning_init(cls):
        super()._tuning_init()
        cls.target = SimInfo
    
    @classmethod
    def test(cls, sim_info, target, interaction_queue):
        # Test: Sim must be teen or older
        if sim_info.age < SimInfo.AGE_TEEN:
            return False
        
        # Test: Target must exist
        if target is None:
            return False
        
        return True
    
    def _execute(self, event=None):
        """Execute the greeting."""
        sim = self.sim
        target = self.target
        
        # Add relationship points
        rel_db = services.relationship_service()
        rel_db.add_relationship_bit(sim.sim_id, target.sim_id, 5)
        
        # Show notification
        from objects.components import ui_components
        ui_components.show_simple_notification(
            sim,
            "JPE Test",
            f"{sim.first_name} greeted {target.first_name}!"
        )
        
        return True

# Register the interaction
JpeTestGreeting.register_interaction()
