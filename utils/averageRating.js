export const calculateAverageRating = (product) => {

    const totalReviews = product.reviews.length;

    if(totalReviews == 0){
        product.averageRating = 0;
    }

    else {

        // I can also use loop but reduce is more efficent...
        // let totalRating = 0;
        // for (let i = 0; i < product.reviews.length; i++) {
        //     totalRating += product.reviews[i].rating;
        // }
        
        // reduce() ek loop ki tarah kaam karta hai jo reviews ke har element pe chalega.
        // acc initial value is 0...

        const totalRating = product.reviews.reduce((acc, rev) => acc + rev.rating, 0)
        product.averageRating = totalRating/totalReviews;       //totalreviews means kitny users ny review dea...
    }
}