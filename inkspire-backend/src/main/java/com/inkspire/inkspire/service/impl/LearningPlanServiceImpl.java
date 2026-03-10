package com.inkspire.inkspire.service.impl;

import com.inkspire.inkspire.model.LearningPlan;
import com.inkspire.inkspire.model.Milestone;
import com.inkspire.inkspire.model.Reminder;
import com.inkspire.inkspire.model.User;
import com.inkspire.inkspire.repository.LearningPlanRepository;
import com.inkspire.inkspire.repository.ReminderRepository;
import com.inkspire.inkspire.service.LearningPlanService;
import com.inkspire.inkspire.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class LearningPlanServiceImpl implements LearningPlanService {
    private static final Logger logger = LoggerFactory.getLogger(LearningPlanServiceImpl.class);
    
    private final LearningPlanRepository learningPlanRepository;
    private final UserService userService;
    private final ReminderRepository reminderRepository;

    public LearningPlanServiceImpl(
            LearningPlanRepository learningPlanRepository,
            UserService userService,
            ReminderRepository reminderRepository) {
        this.learningPlanRepository = learningPlanRepository;
        this.userService = userService;
        this.reminderRepository = reminderRepository;
    }

    @Override
    public LearningPlan createLearningPlan(LearningPlan plan, Long userId) {
        try {
            User user = userService.getUserById(userId);
            plan.setUser(user);
            
            // Set timestamps
            LocalDateTime now = LocalDateTime.now();
            plan.setCreatedAt(now);
            plan.setUpdatedAt(now);
            
            // Save the plan first
            LearningPlan savedPlan = learningPlanRepository.save(plan);
            
            // Create a reminder for the new plan
            Reminder reminder = new Reminder();
            reminder.setUser(user);
            reminder.setPlan(savedPlan);  // Set the plan reference
            reminder.setMessage("New learning plan created: " + plan.getTitle());
            reminder.setDueDate(now.plusDays(7));
            reminder.setCreatedAt(now);
            reminder.setCompleted(false);
            reminderRepository.save(reminder);
            
            return savedPlan;
        } catch (Exception e) {
            logger.error("Error creating learning plan: ", e);
            throw new RuntimeException("Failed to create learning plan: " + e.getMessage());
        }
    }

    @Override
    public List<LearningPlan> getPlansByUser(Long userId) {
        User user = userService.getUserById(userId);
        return learningPlanRepository.findByUser(user);
    }

    @Override
    public LearningPlan getLearningPlan(Long id, Long userId) {
        LearningPlan plan = learningPlanRepository.findById(id)
            .orElseThrow(() -> new RuntimeException("Learning plan not found"));
        
        if (!plan.getUser().getId().equals(userId) && !plan.isPublic()) {
            throw new RuntimeException("Access denied");
        }
        
        return plan;
    }

    @Override
    public LearningPlan updateLearningPlan(LearningPlan plan) {
        try {
            // Ensure we have all required fields
            if (plan.getUser() == null) {
                throw new RuntimeException("User cannot be null");
            }
            
            // Set default values for milestones if needed
            if (plan.getMilestones() != null) {
                for (Milestone milestone : plan.getMilestones()) {
                    if (milestone.getTitle() == null && milestone.getDescription() != null) {
                        milestone.setTitle(milestone.getDescription().substring(0, 
                            Math.min(50, milestone.getDescription().length())));
                    }
                    milestone.setNotes(milestone.getNotes() == null ? "" : milestone.getNotes());
                }
            }
            
            // Save the plan
            return learningPlanRepository.save(plan);
        } catch (Exception e) {
            logger.error("Error updating learning plan: {}", e.getMessage());
            throw new RuntimeException("Failed to update learning plan: " + e.getMessage());
        }
    }

    @Override
    public void deleteLearningPlan(Long id) {
        learningPlanRepository.deleteById(id);
    }

    @Override
    public List<LearningPlan> getRecommendedPlans(Long userId) {
        return learningPlanRepository.findByIsPublicTrue();
    }

    @Override
    public LearningPlan updateMilestoneProgress(Long planId, Long milestoneId, boolean completed, String notes) {
        LearningPlan plan = learningPlanRepository.findById(planId)
            .orElseThrow(() -> new RuntimeException("Learning plan not found"));
        
        plan.getMilestones().stream()
            .filter(m -> m.getId().equals(milestoneId))
            .findFirst()
            .ifPresent(milestone -> {
                milestone.setCompleted(completed);
                milestone.setNotes(notes);
            });
            
        return learningPlanRepository.save(plan);
    }

    @Override
    public List<Reminder> getProgressReminders(Long userId) {
        try {
            User user = userService.getUserById(userId);
            List<Reminder> reminders = reminderRepository.findByUser(user);
            
            // Filter out reminders with invalid learning plan references
            return reminders.stream()
                .filter(reminder -> {
                    if (reminder.getPlan() != null) {
                        try {
                            learningPlanRepository.findById(reminder.getPlan().getId())
                                .orElseThrow(() -> new RuntimeException("Learning plan not found"));
                            return true;
                        } catch (Exception e) {
                            logger.warn("Skipping reminder with invalid plan reference: {}", reminder.getId());
                            return false;
                        }
                    }
                    return true; // Include reminders without plan references
                })
                .collect(Collectors.toList());
        } catch (Exception e) {
            logger.error("Error fetching reminders: ", e);
            throw new RuntimeException("Failed to fetch reminders: " + e.getMessage());
        }
    }

    @Override
    public Reminder createReminder(Reminder reminder, Long userId) {
        try {
            User user = userService.getUserById(userId);
            reminder.setUser(user);
            
            // Validate learning plan reference if present
            if (reminder.getPlan() != null) {
                LearningPlan plan = learningPlanRepository.findById(reminder.getPlan().getId())
                    .orElseThrow(() -> new RuntimeException("Learning plan not found"));
                reminder.setPlan(plan);
            }
            
            reminder.setCreatedAt(LocalDateTime.now());
            return reminderRepository.save(reminder);
        } catch (Exception e) {
            logger.error("Error creating reminder: ", e);
            throw new RuntimeException("Failed to create reminder: " + e.getMessage());
        }
    }

    @Override
    public void deleteReminder(Long id) {
        reminderRepository.deleteById(id);
    }
}