package com.inkspire.inkspire.payload;

import com.inkspire.inkspire.model.Milestone;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.List;
import com.fasterxml.jackson.annotation.JsonProperty;

@Data
public class LearningPlanResponse {
    private Long id;
    private String title;
    private String description;
    private List<Milestone> milestones;
    private List<String> learningMaterials;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    @JsonProperty("isPublic")
    private boolean isPublic;
    private UserSummary user;

    @Data
    public static class UserSummary {
        private Long id;
        private String name;
        private String email;
    }

    @JsonProperty("isPublic")
    public boolean isPublic() {
        return isPublic;
    }

    @JsonProperty("isPublic")
    public void setPublic(boolean isPublic) {
        this.isPublic = isPublic;
    }
} 