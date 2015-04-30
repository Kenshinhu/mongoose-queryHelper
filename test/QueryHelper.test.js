/**
 * Created by jianxinhu on 15/4/30.
 */
var should = require('should');
var mongoose = require('mongoose');
var async = require('async');

var queryHelper = require("../index");

mongoose.connect('mongodb://localhost/qh_test_data');

var Schema = mongoose.Schema;
var Person,PersonQuery;
var personMockData = require('./personMockData.json');



describe(__filename, function () {

    before(function(done){
        //integration data

        var personSchema = new Schema({
                                        first_name :String,
                                        last_name :String,
                                        email     :String,
                                        country   :String,
                                        from      :String,
                                        ip_address:String,
                                        createAt  :{
                                                    type:String , default: Date.now
                                                   }
                                     });

        Person = mongoose.model('Person', personSchema);

        PersonQuery = new queryHelper('Person',mongoose);

        Person.remove({},function(){
           //clear order Data
            console.log("personMockData.length : %s",personMockData.length);
            async.each(personMockData,function(item,next){
                Person.create(item,function(err){
                    err ? next(err) : next();
                });
            },function(err,result){
                done(err);
            });

        });
    });


    it('#query',function(done){

        PersonQuery.query().exec(function(err,result){

            should.not.exists(err);
            result.length.should.equal(personMockData.length);
            done();

        });
    });

    it('#query with multi condition',function(done){

        PersonQuery.query({"country":"china"}).query({"country":"Sweden"}).select('ip_address').exec(function(err,result){

            should.not.exists(err);
            result.length.should.above(0);
            done();

        });
    })

    it('#query with single data',function(done){

        PersonQuery
                .queryOne({"first_name":"Kevin","country":"China"})
                .select("ip_address")
                .exec(function(err,result){
                    should.not.exists(err);
                    result.should.have.property("ip_address");
                    done();
                });

    })

    it('#pagination',function(done){

        PersonQuery
            .query({"first_name":queryHelper.like("%Kimber%")})
            .query({"country":"China"})
            .sort('createAt')
            .sort('ip_address')
            .limit(1,10)
            .pagination(function(err,data,total,totalPage,currentPageIndex){
                console.log(arguments);
                data.length.should.be.above(0);
                total.should.be.above(0);
                totalPage.should.be.above(0);
                currentPageIndex.should.be.above(0);

                done();
            })

    });



});