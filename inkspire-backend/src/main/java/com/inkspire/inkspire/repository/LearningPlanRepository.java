package com.inkspire.inkspire.repository;

import com.inkspire.inkspire.model.LearningPlan;
import com.inkspire.inkspire.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LearningPlanRepository extends JpaRepository<LearningPlan, Long> {
    List<LearningPlan> findByUser(User user);
    List<LearningPlan> findByUserAndIsPublicTrue(User user);
    List<LearningPlan> findByIsPublicTrue();
}
