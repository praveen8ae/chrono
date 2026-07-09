from django.db import models

from apps.roster.models import Employee


class LeaveType(models.TextChoices):
    ANNUAL = 'annual', 'Annual'
    SICK = 'sick', 'Sick'
    PERSONAL = 'personal', 'Personal'
    HOLIDAY = 'holiday', 'Holiday'


class LeaveStatus(models.TextChoices):
    PENDING = 'pending', 'Pending'
    APPROVED = 'approved', 'Approved'
    REJECTED = 'rejected', 'Rejected'


class LeaveRequest(models.Model):
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='leave_requests')
    start_date = models.DateField()
    end_date = models.DateField()
    days = models.PositiveIntegerField()
    type = models.CharField(max_length=16, choices=LeaveType.choices)
    reason = models.TextField()
    status = models.CharField(max_length=16, choices=LeaveStatus.choices, default=LeaveStatus.PENDING)
    admin_message = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']


class LeaveBalance(models.Model):
    employee = models.OneToOneField(Employee, on_delete=models.CASCADE, related_name='leave_balance')
    annual_leave = models.PositiveIntegerField(default=0)
    sick_leave = models.PositiveIntegerField(default=0)
    used_annual = models.PositiveIntegerField(default=0)
    used_sick = models.PositiveIntegerField(default=0)
