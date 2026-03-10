package com.inkspire.inkspire.config;

import com.fasterxml.jackson.core.JsonParser;
import com.fasterxml.jackson.databind.DeserializationContext;
import com.fasterxml.jackson.databind.JsonDeserializer;
import java.io.IOException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import org.springframework.boot.jackson.JsonComponent;

@JsonComponent
public class LocalDateTimeDeserializer extends JsonDeserializer<LocalDateTime> {
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss");

    @Override
    public LocalDateTime deserialize(JsonParser p, DeserializationContext ctxt) throws IOException {
        String dateString = p.getText().trim();
        try {
            // Remove any timezone information
            if (dateString.contains("Z")) {
                dateString = dateString.substring(0, dateString.indexOf("Z"));
            }
            if (dateString.contains("+")) {
                dateString = dateString.substring(0, dateString.indexOf("+"));
            }
            if (dateString.contains(".")) {
                dateString = dateString.substring(0, dateString.indexOf("."));
            }
            return LocalDateTime.parse(dateString, formatter);
        } catch (DateTimeParseException e) {
            throw new IOException("Could not parse date: " + dateString, e);
        }
    }
} 