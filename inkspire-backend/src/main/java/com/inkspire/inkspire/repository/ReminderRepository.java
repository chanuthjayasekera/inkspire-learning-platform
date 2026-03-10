package com.inkspire.inkspire.repository;

import com.inkspire.inkspire.model.Reminder;
import com.inkspire.inkspire.model.User;
import com.inkspire.inkspire.model.LearningPlan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface ReminderRepository extends JpaRepository<Reminder, Long> {
    List<Reminder> findByUser(User user);
    List<Reminder> findByPlan(LearningPlan plan);
    List<Reminder> findByUserAndPlan(User user, LearningPlan plan);
}