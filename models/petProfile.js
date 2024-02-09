const conn = require('../connection/db');

const PetProfile = (petProfile) => {
    this.petName = petProfile.petName;
    this.petAge = petProfile.petAge;
    this.vaccinationDate = petProfile.vaccinationDate;
    this.petCategoryId = petProfile.petCategoryId;
    this.ownerId = petProfile.ownerId;
};

PetProfile.create = () => {
    
}