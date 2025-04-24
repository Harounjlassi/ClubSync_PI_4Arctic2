package tn.esprit.clubsync.Services;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender emailSender;

    public void sendEmail(String to, String subject, String text) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom("clubsync02@gmail.com");  // Adresse de l'expéditeur
        message.setTo(to); // Destinataire
        message.setSubject(subject);  // Sujet
        message.setText(text);  // Corps du message
        emailSender.send(message);
    }
}
