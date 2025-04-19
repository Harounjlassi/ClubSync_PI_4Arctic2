import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ClubService } from '../services/club.service';
import { Club } from '../models/club.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-edit-club-dialog',
  templateUrl: './edit-club-dialog.component.html',
  styleUrls: ['./edit-club-dialog.component.css']
})
export class EditClubDialogComponent implements OnInit {
  clubForm: FormGroup;
  isSubmitting = false;
  categories: string[] = ['Sport', 'Art', 'Culture', 'Musique', 'Technologie', 'Science', 'Littérature', 'Autre'];
  logoFile: File = null;
  logoPreview: string | ArrayBuffer = null;
  
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
    public dialogRef: MatDialogRef<EditClubDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { club: Club },
    private snackBar: MatSnackBar,
    private toastr: ToastrService
  ) {
    // Ajouter les nouveaux champs (logo, slogan, categorie) au formulaire
    this.clubForm = this.fb.group({
      name: ['', [
        Validators.required, 
        Validators.pattern('^[a-zA-ZÀ-ÿ\\s\'-]+$'), // Pattern pour n'accepter que des lettres, espaces, apostrophes et tirets
        Validators.minLength(3),
        Validators.maxLength(50),
        this.noConsecutiveSpaces,
        this.noBadWords.bind(this)
      ]], 
      description: ['', [
        Validators.required,
        Validators.minLength(10), // Minimum 10 characters for description
        Validators.maxLength(500),
        this.noConsecutiveSpaces,
        this.noBadWords.bind(this)
      ]],
      logo: ['', [Validators.required]],  // Nouveau champ
      slogan: ['', [
        Validators.required,
        Validators.minLength(5),
        Validators.maxLength(100),
        this.noConsecutiveSpaces,
        this.noBadWords.bind(this)
      ]],      
      categorie: ['', [Validators.required]]  // Nouveau champ
    });
  }

  ngOnInit(): void {
    // Peupler les champs du formulaire avec les données existantes du club
    this.clubForm.patchValue({
      name: this.data.club.name,
      description: this.data.club.description,
      logo: this.data.club.logo,       // Peupler le champ logo
      slogan: this.data.club.slogan,   // Peupler le champ slogan
      categorie: this.data.club.categorie  // Peupler le champ categorie
    });
    
    // Initialiser le preview du logo si existant
    if (this.data.club.logo) {
      this.logoPreview = this.data.club.logo;
    }
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

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length) {
      const file = input.files[0];
      
      // Valider le type de fichier
      if (!file.type.includes('image/')) {
        alert('Please select a valid image');
        return;
      }
      
      // Lire le fichier comme une URL data pour obtenir le base64
      const reader = new FileReader();
      reader.onload = () => {
        this.logoPreview = reader.result;
        // Stocker la chaîne base64 dans le formulaire
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
  
      const updatedClub: Club = {
        ...this.data.club,
        ...this.clubForm.value
      };
  
      this.clubService.updateClub(updatedClub).subscribe({
        next: (result) => {
          this.dialogRef.close(result);
          this.toastr.success('Club updated successfully!');
        },
        error: (error) => {
          console.error('Error updating club:', error);
          this.toastr.error('❌ Failed to update club', 'Error');
          this.isSubmitting = false;
        },
        complete: () => this.isSubmitting = false
      });
    }
  }
  
  // Validation personnalisée pour éviter les espaces multiples consécutifs
  noConsecutiveSpaces(control: FormControl): {[key: string]: any} | null {
    const value = control.value || '';
    if (value.includes('  ')) {
      return { 'consecutiveSpaces': true };
    }
    return null;
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}