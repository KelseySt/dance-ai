import numpy as np 
from scipy.spatial.distance import euclidean

from fastdtw import fastdtw

# returns indexes of mismatched data 
def calculate(X, Y): 
    distance, path = fastdtw(X, Y, dist=2)
    print(path)
    val = one_to_many_mapping(2, path)
    print(val)
    return val 
    
def one_to_many_mapping(threshold, path):
    dict = {}
    for pair in path: 
        if pair[0] in dict: 
           dict[pair[0]].append(pair[1])
        else: 
           dict[pair[0]] = [pair[1]] 

    mismatch_pairs = {}
    for key, value in dict.items(): 
       if len(value) > threshold: 
           mismatch_pairs[key] = value

    return mismatch_pairs  


# from fastdtw import fastdtw
# from scipy.spatial.distance import euclidean
# series_1 = np.array([[1, 2], [2, 3], [3, 4], [4, 5]])
# series_2 = np.array([[2, 3], [3, 4], [4, 5]])
# calculate(series_1, series_2)