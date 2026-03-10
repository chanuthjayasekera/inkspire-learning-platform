package com.inkspire.inkspire.service;

import com.inkspire.inkspire.model.LearningPlan;
import com.inkspire.inkspire.model.Reminder;
import java.util.List;

public interface LearningPlanService {
    // Learning Plan operations
    LearningPlan createLearningPlan(LearningPlan plan, Long userId);
    List<LearningPlan> getPlansByUser(Long userId);
    LearningPlan getLearningPlan(Long id, Long userId);
    LearningPlan updateLearningPlan(LearningPlan plan);
    void deleteLearningPlan(Long id);
    List<LearningPlan> getRecommendedPlans(Long userId);
    
    // Milestone operations
    LearningPlan updateMilestoneProgress(Long planId, Long milestoneId, boolean completed, String notes);
    
    // Reminder operations
    List<Reminder> getProgressReminders(Long userId);
    Reminder createReminder(Reminder reminder, Long userId);
    void deleteReminder(Long id);
}
