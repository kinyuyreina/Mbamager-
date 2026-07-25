"""
Mbamager Savings Goal Service

This module handles business logic for managing, updating, and evaluating savings goals.
"""

from datetime import date
from decimal import Decimal
from typing import Optional

from app.models.savings_goal import SavingsGoal, SavingsGoalStatus
from app.models.notification import NotificationType
from app.repositories.savings_goal_repository import SavingsGoalRepository
from app.schemas.savings_goal import SavingsGoalCreate, SavingsGoalUpdate, SavingsGoalProgressResponse
from app.services.base_service import BaseService
from app.services.notification_service import NotificationService

class SavingsGoalService(BaseService[SavingsGoal]):
    """
    Service layer coordinating SavingsGoal CRUD, progress, and contribution projections.
    """

    def __init__(
        self,
        repository: SavingsGoalRepository,
        notification_service: Optional[NotificationService] = None,
    ) -> None:
        """
        Initialize with repository and optional NotificationService.
        """
        super().__init__(repository)
        self.notification_service = notification_service

    async def get_user_goals(self, user_id: int) -> list[SavingsGoal]:
        """
        Retrieve all savings goals belonging to a user.
        """
        return await self.repository.get_by_user_id(user_id)

    async def get_goal(self, user_id: int, goal_id: int) -> SavingsGoal:
        """
        Retrieve a specific savings goal after verifying user ownership.
        """
        goal = await self.repository.get_by_id(goal_id)
        if not goal or goal.user_id != user_id:
            raise ValueError("Savings goal not found")
        return goal

    async def create_goal(
        self,
        user_id: int,
        goal_data: SavingsGoalCreate,
    ) -> SavingsGoal:
        """
        Create a new savings goal.
        Automatically checks if the goal is already achieved and triggers a notification.
        """
        status = SavingsGoalStatus.ACTIVE
        if goal_data.current_amount >= goal_data.target_amount:
            status = SavingsGoalStatus.COMPLETED

        goal = SavingsGoal(
            user_id=user_id,
            name=goal_data.name,
            target_amount=goal_data.target_amount,
            current_amount=goal_data.current_amount,
            target_date=goal_data.target_date,
            status=status,
        )
        created = await self.repository.create(goal)

        if status == SavingsGoalStatus.COMPLETED and self.notification_service:
            try:
                await self.notification_service.create_notification(
                    user_id=user_id,
                    title="Savings Goal Reached!",
                    message=f"Congratulations! You have reached your savings goal '{goal.name}' of {goal.target_amount}!",
                    type=NotificationType.GOAL_REACHED
                )
            except Exception:
                pass  # Avoid blocking transaction creation if notification fails

        return created

    async def update_goal(
        self,
        user_id: int,
        goal_id: int,
        goal_data: SavingsGoalUpdate,
    ) -> SavingsGoal:
        """
        Update an existing savings goal.
        Triggers completion routines and notifications if transitioned to complete.
        """
        goal = await self.get_goal(user_id, goal_id)
        old_status = goal.status

        update_dict = goal_data.model_dump(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(goal, key, value)

        # Automatically complete goal if limit is reached
        if goal.current_amount >= goal.target_amount and goal.status == SavingsGoalStatus.ACTIVE:
            goal.status = SavingsGoalStatus.COMPLETED

        updated = await self.repository.update(goal)

        # Trigger notification if transition occurred
        if updated.status == SavingsGoalStatus.COMPLETED and old_status == SavingsGoalStatus.ACTIVE and self.notification_service:
            try:
                await self.notification_service.create_notification(
                    user_id=user_id,
                    title="Savings Goal Reached!",
                    message=f"Congratulations! You have reached your savings goal '{goal.name}' of {goal.target_amount}!",
                    type=NotificationType.GOAL_REACHED
                )
            except Exception:
                pass

        return updated

    async def delete_goal(self, user_id: int, goal_id: int) -> None:
        """
        Delete a savings goal after verifying user ownership.
        """
        goal = await self.get_goal(user_id, goal_id)
        await self.repository.delete(goal)

    async def calculate_progress(self, user_id: int, goal_id: int) -> SavingsGoalProgressResponse:
        """
        Evaluate goal completion metrics.
        """
        goal = await self.get_goal(user_id, goal_id)
        
        remaining_amount = max(Decimal("0.00"), goal.target_amount - goal.current_amount)
        if goal.target_amount > Decimal("0.00"):
            percentage_completed = (goal.current_amount / goal.target_amount) * Decimal("100.00")
        else:
            percentage_completed = Decimal("0.00")

        # Project recommended monthly contribution
        monthly_contribution = await self.recommend_monthly_contribution(user_id, goal_id)

        return SavingsGoalProgressResponse(
            goal_id=goal.id,
            name=goal.name,
            target_amount=goal.target_amount,
            current_amount=goal.current_amount,
            remaining_amount=remaining_amount,
            percentage_completed=percentage_completed,
            target_date=goal.target_date,
            status=goal.status,
            monthly_contribution_recommended=monthly_contribution,
        )

    async def recommend_monthly_contribution(self, user_id: int, goal_id: int) -> Decimal:
        """
        Project savings rate necessary to satisfy goal by deadline.
        """
        goal = await self.get_goal(user_id, goal_id)
        if goal.status == SavingsGoalStatus.COMPLETED or goal.current_amount >= goal.target_amount:
            return Decimal("0.00")

        remaining_amount = goal.target_amount - goal.current_amount
        today = date.today()
        
        # Calculate monthly difference
        months_diff = (goal.target_date.year - today.year) * 12 + goal.target_date.month - today.month
        if months_diff <= 0:
            months_diff = 1  # Require saving the full remainder this month

        recommended = remaining_amount / Decimal(str(months_diff))
        return max(Decimal("0.00"), recommended)
