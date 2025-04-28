package tn.esprit.clubsync.dtos;

public class VerifyCodeRequest {
    private String email;
    private String code;
    // getters and setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getCode() { return code; }
    public void setCode(String code) { this.code = code; }
}
