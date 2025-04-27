import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef } from '@angular/material/dialog';
import { ClubService } from '../services/club.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-add-club-dialog',
  templateUrl: './add-club-dialog.component.html',
  styleUrls: ['./add-club-dialog.component.css']
})
export class AddClubDialogComponent implements OnInit {
  clubForm: FormGroup;
  categories: string[] = ['Sport', 'Art', 'Culture', 'Musique', 'Technologie', 'Science', 'Littérature', 'Autre'];
  logoFile: File = null;
  logoPreview: string | ArrayBuffer = null;
  isSubmitting: boolean = false;
  
  // Liste complète des mots inappropriés en anglais
  private badWords: string[] = [
    // Common profanity and slurs
    'anal', 'anus', 'arse', 'ass', 'ballsack', 'balls', 'bastard', 'bitch', 'biatch', 
    'bloody', 'blowjob', 'bollock', 'bollok', 'boner', 'boob', 'bugger', 'bum', 
    'butt', 'buttplug', 'clitoris', 'cock', 'coon', 'crap', 'cunt', 'damn', 'dick', 
    'dildo', 'dyke', 'fag', 'feck', 'fellate', 'fellatio', 'felching', 'fuck', 
    'fucking', 'fudgepacker', 'flange', 'goddamn', 'hell', 'homo', 'jerk', 'jizz', 
    'knobend', 'labia', 'muff', 'nigger', 'nigga', 'penis', 'piss', 'poop', 'prick', 
    'pube', 'pussy', 'queer', 'scrotum', 'sex', 'shit', 'slut', 'smegma', 'spunk', 
    'tit', 'tosser', 'turd', 'twat', 'vagina', 'wank', 'whore', 'wtf',
    
    // Offensive terms
    'retard', 'spastic', 'nazi', 'terrorist', 'suicide', 'kill', 'rape', 'racist', 'stupid',
    
    // Drug references
    'cocaine', 'heroin', 'cannabis', 'weed', 'crack', 'meth', 'marijuana',
    
    // Evasive spellings
    'sh1t', 'f*ck', 'f**k', 'b*tch', 'a$$', 'a**', 'd*ck', 'p*ssy'
  ];
  
  constructor(
    private fb: FormBuilder,
    private clubService: ClubService,
    public dialogRef: MatDialogRef<AddClubDialogComponent>,
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.clubForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.pattern('^[a-zA-ZÀ-ÿ\\s\'-]+$'),
        Validators.minLength(3),
        Validators.maxLength(50),
        this.noConsecutiveSpaces,
        this.noBadWords.bind(this)
      ]],      
      description: ['', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(500),
        this.noConsecutiveSpaces,
        this.noBadWords.bind(this)
      ]],
      logo: ['', Validators.required],
      slogan: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
        this.noConsecutiveSpaces,
        this.noBadWords.bind(this)
      ]],      
      categorie: ['', Validators.required],
    });
  }

  // Validateur amélioré pour les mots inappropriés
  noBadWords(control: FormControl): {[key: string]: any} | null {
    if (!control.value) return null;
    
    const value = control.value.toLowerCase();
    
    // Vérifiez les mots complets (avec des limites de mots)
    const words = value.split(/\s+/);
    const foundBadWords = words.filter(word => {
      // Enlever les caractères spéciaux pour la vérification
      const cleanWord = word.replace(/[^a-zA-Z0-9]/g, '');
      return this.badWords.includes(cleanWord.toLowerCase());
    });
    
    // Vérifier également si les mauvais mots sont des sous-chaînes
    const containsBadWords = this.badWords.filter(badWord => {
      // Si le mot inapproprié est court, il faut qu'il soit un mot indépendant
      if (badWord.length <= 3) {
        return words.some(w => w.toLowerCase() === badWord);
      }
      // Pour les mots plus longs, vérifier s'ils sont présents comme une sous-chaîne
      return value.toLowerCase().includes(badWord);
    });
    
    const allFoundBadWords = [...new Set([...foundBadWords, ...containsBadWords])];
    
    if (allFoundBadWords.length > 0) {
      return { 'badWords': { forbiddenWords: allFoundBadWords } };
    }
    
    return null;
  }

  // Validation pour éviter les espaces multiples consécutifs
  noConsecutiveSpaces(control: FormControl): {[key: string]: any} | null {
    const value = control.value || '';
    if (value.includes('  ')) {
      return { 'consecutiveSpaces': true };
    }
    return null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Valider le type de fichier
      if (!file.type.includes('image/')) {
        alert('Veuillez sélectionner une image valide');
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
        this.clubForm.patchValue({
          logo: reader.result.toString()
        });
        this.clubForm.get('logo').markAsTouched();
      };
      reader.readAsDataURL(file);
    }
  }
  
  onSubmit(): void {
    if (this.clubForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;
      
      this.clubService.addClub(this.clubForm.value).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
          this.toastr.success(' Club added succesfully!');
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout du club:', error);
          this.toastr.error('❌ Échec de l\'ajout du club', 'Erreur');
          this.isSubmitting = false;
        },
        complete: () => this.isSubmitting = false
      });
    }
  }
  
  private showSuccessNotification(): void {
    this.toastr.success('✅ Club ajouté avec succès !', 'Succès', {
      timeOut: 3000,
      positionClass: 'toast-top-right',
      progressBar: true,
      closeButton: true
    });
  }
  
  onCancel(): void {
    this.dialogRef.close();
  }
}