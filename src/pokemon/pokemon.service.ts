import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, Delete } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { isValidObjectId, Model } from 'mongoose';
import { CreatePokemonDto } from './dto/create-pokemon.dto';
import { UpdatePokemonDto } from './dto/update-pokemon.dto';
import { Pokemon } from './entities/pokemon.entity';

@Injectable()
export class PokemonService {


  constructor(

    @InjectModel(Pokemon.name)
    private readonly pokemonModel: Model<Pokemon>

  ) {}


 async create(createPokemonDto: CreatePokemonDto) {

    createPokemonDto.name = createPokemonDto.name.toLowerCase();
    try {
      const pokemon = await this.pokemonModel.create(createPokemonDto);
      return {
        message: `This action creates a new pokemon`,
        action:pokemon
      };
    } catch (error) {
      this.handleExceptions(error);
    }

  }

  findAll() {
    return `This action returns all pokemon`;
  }

 async findOne(term: string) {

      let pokemon : Pokemon;

      if(!isNaN(+term)) {
        pokemon = await this.pokemonModel.findOne({ no: term });
      }

      if(!pokemon &&  isValidObjectId(term) ) {
        pokemon = await this.pokemonModel.findById(term);
      }  

      if(!pokemon) {
        pokemon = await this.pokemonModel.findOne({ name: term.toLowerCase().trim() });
      }
    

      if( !pokemon ) 
      throw new NotFoundException(`This pokemon "${term}" does not exist`);
        return {
          message:`This action returns a #${term} pokemon`,
          action: pokemon
        };


  }



  async update(term: string, updatePokemonDto: UpdatePokemonDto) {

    const {action} = await this.findOne(term);

      if(updatePokemonDto.name) {
        updatePokemonDto.name = updatePokemonDto.name.toLowerCase();
        try {

          await action.updateOne(updatePokemonDto,{new: true});

          return {
            message:`This action updates a #${term} pokemon`,
            action: {...action.toJSON(), ...updatePokemonDto}
          };
          
        } catch (error) {
          this.handleExceptions(error);
        }
      }


  }

  async remove(id: string) {

    // const {action} = await this.findOne(id);
    // await action.deleteOne();
    //const result = await this.pokemonModel.findByIdAndDelete(id);

    const {deletedCount} = await this.pokemonModel.deleteOne({_id: id});
    if(deletedCount === 0) {
      throw new BadRequestException(`This pokemon ¨${id} not found`);
    }


    return {
      message: `This action removes a pokemon`,
    }
  }


    private handleExceptions(error:any){

      if(error.code === 11000) {
        throw new BadRequestException(`This pokemon already exists in the database ${ JSON.stringify(error.keyValue) }`);
      }
      console.log(error);
      throw new InternalServerErrorException(`This action could not be completed - Ckeck server logs for more information`);
    }



}
