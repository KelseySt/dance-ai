import numpy as np 
from scipy.spatial.distance import euclidean

from fastdtw import fastdtw

# returns indexes of mismatched data 
def calculate(X, Y): 
    distance, path = fastdtw(X, Y, dist=2)
    print(path)
    val1 = stu_to_ref(2, path)
    val2 = ref_to_stu(2, path)
    return val1 , val2
    
def stu_to_ref(threshold, path):
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

def ref_to_stu(threshold, path): 
    result = {}
    for first, second in path:
        if second not in result:
            result[second] = []  # Initialize the list if key doesn't exist
        result[second].append(first)  # Append the first value to the list
    mismatch_pairs = {}
    for key, value in result.items(): 
       if len(value) > threshold: 
           mismatch_pairs[key] = value

    return mismatch_pairs  

